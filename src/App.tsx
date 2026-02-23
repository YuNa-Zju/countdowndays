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
      className="min-h-screen bg-base-200 font-sans transition-colors duration-300 rounded-4xl overflow-hidden"
    >
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <EventList />
      </main>
      <FloatingButton />
      <GlobalModals />

      <Toaster
        position="bottom-center"
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
