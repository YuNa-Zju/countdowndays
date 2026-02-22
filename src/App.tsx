import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import Header from "./components/Header";
import EventList from "./components/EventList";
import FloatingButton from "./components/FloatingButton";
import GlobalModals from "./components/GlobalModals";
import { useEventStore } from "./store/eventStore";
import FabWidget from "./components/FabWidget";
// 🌟 确保引入了 Window，用于跨窗口唤醒
import { getCurrentWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";
import { useUiBus } from "./store/uiBus";
import "./App.css";

function App() {
  const windowLabel = getCurrentWindow().label;
  // 🌟 从 Zustand 提取 theme，给主界面和悬浮窗同时使用
  const { openCreateModal, theme } = useUiBus();
  const { fetchData } = useEventStore();

  // 🌟 1. 如果当前是 fab 窗口，渲染悬浮窗，并强行注入主题数据和透明背景
  // 🌟 1. 如果当前是 fab 窗口，渲染悬浮窗
  if (windowLabel === "fab") {
    return (
      // 外壳透明+p-2，以便让里面的圆角卡片阴影显示出来
      <div
        data-theme={theme}
        className="w-screen h-screen bg-transparent overflow-hidden text-base-content rounded-2xl"
      >
        <FabWidget />
      </div>
    );
  }

  // 👇 下面全都是主窗口 (main) 的逻辑

  useEffect(() => {
    // 监听悬浮窗发来的新建事件
    const unlisten = listen("wake-main-and-create", async () => {
      openCreateModal(); // 调起 Zustand 里的弹窗
    });

    return () => {
      unlisten.then((f) => f());
    };
  }, [openCreateModal]);

  // 🌟 核心初始化：组件挂载时，主动去拿一次数据
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 🌟 禁用 F5 与右键刷新逻辑
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "F5" ||
        (e.ctrlKey && e.key.toLowerCase() === "r") ||
        (e.metaKey && e.key.toLowerCase() === "r")
      ) {
        e.preventDefault();
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (import.meta.env.PROD) {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  return (
    // 🌟 3. 修复了 data-theme={theme} 的写法，它不能写进字符串 className 里
    <div
      data-theme={theme}
      className="min-h-screen bg-base-200 font-sans transition-colors duration-300 rounded-4xl"
    >
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <EventList />
      </main>
      <FloatingButton />

      <GlobalModals />

      <Toaster
        position="bottom-center"
        reverseOrder={false}
        toastOptions={{
          className:
            "!bg-base-100 !text-base-content !rounded-full !shadow-xl !border !border-base-200 !px-6 !py-3 font-medium",
          duration: 3000,
        }}
      />
    </div>
  );
}

export default App;
