import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import Header from "./components/Header";
import EventList from "./components/EventList";
import FloatingButton from "./components/FloatingButton";
import GlobalModals from "./components/GlobalModals";
import { useEventStore } from "./store/eventStore";
import "./App.css";

function App() {
  // 1. 从 Store 中拿出 fetchData 方法
  const { fetchData } = useEventStore();

  // 2. 🌟 核心初始化：组件挂载时，主动去拿一次数据
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    // 拦截键盘快捷键
    const handleKeyDown = (e: KeyboardEvent) => {
      // 禁用 F5，以及 Ctrl+R (Windows) / Cmd+R (Mac)
      if (
        e.key === "F5" ||
        (e.ctrlKey && e.key.toLowerCase() === "r") ||
        (e.metaKey && e.key.toLowerCase() === "r")
      ) {
        e.preventDefault();
      }
    };

    // 拦截原生右键菜单（防止用户通过右键点击“重新加载”）
    // 注意：如果你自己实现了右键菜单（比如之前代码里的 openContextMenu），你需要确保那个事件加了 e.stopPropagation()
    const handleContextMenu = (e: MouseEvent) => {
      // 只有在你需要自定义全屏右键拦截时使用，否则会阻挡你本身的右键逻辑
      if (import.meta.env.PROD) {
        // 建议只在生产环境禁用
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
    <div className="min-h-screen bg-base-200 font-sans transition-colors duration-300">
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
