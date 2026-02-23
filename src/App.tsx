import { Toaster } from "react-hot-toast";
import Header from "./components/Header";
import EventList from "./components/EventList";
import FloatingButton from "./components/FloatingButton";
import GlobalModals from "./components/GlobalModals";
import FabWidget from "./components/FabWidget";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useAppBoot } from "./hooks/useAppBoot";
import "./App.css";
import TrayMenu from "./components/TrayMenu";

function App() {
  const windowLabel = getCurrentWindow().label;
  const { resolvedTheme } = useAppBoot();

  // 🌟 一行代码接管所有的快捷键拦截、数据请求、窗口通信
  useAppBoot();

  if (windowLabel === "tray") {
    return (
      <div
        data-theme={resolvedTheme}
        className="w-screen h-screen bg-transparent overflow-hidden text-base-content select-none cursor-default"
      >
        <TrayMenu />
      </div>
    );
  }

  // 渲染悬浮窗 (Fab)
  if (windowLabel === "fab") {
    return (
      <div
        data-theme={resolvedTheme}
        className="w-screen h-screen bg-transparent overflow-hidden text-base-content rounded-2xl select-none cursor-default"
      >
        <FabWidget />
      </div>
    );
  }

  // 渲染主界面 (Main)
  return (
    <div
      data-theme={resolvedTheme}
      className="h-screen w-screen bg-base-200 font-sans transition-colors duration-300 rounded-[2rem] overflow-hidden relative"
      // 🌟 这个兜底的裁切遮罩千万别删，它保证了内部列表滚动时不会破坏底部的圆角
      style={{ WebkitMaskImage: "linear-gradient(white, white)" }}
    >
      {/* 滚动层：绝对定位完美铺满外层，原生文档流，保证动画绝不消失 */}
      <div className="absolute inset-0 overflow-y-auto overflow-x-hidden">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-6">
          <EventList />
        </main>
      </div>

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
