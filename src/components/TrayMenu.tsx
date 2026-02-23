import { useEffect, useState, useRef } from "react";
import { getCurrentWindow, Window } from "@tauri-apps/api/window";
// 🌟 引入物理分辨率/逻辑分辨率的工具类
import { LogicalSize } from "@tauri-apps/api/dpi";
import { invoke } from "@tauri-apps/api/core";
import { exit } from "@tauri-apps/plugin-process";
import { Plus, Maximize2, X, Layers } from "lucide-react";

export default function TrayMenu() {
  const appWindow = getCurrentWindow();
  const [fabEnabled, setFabEnabled] = useState(true);

  // 🌟 给内容卡片挂上 Ref，用来测量它的真实高度
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    invoke<boolean>("get_fab_state").then(setFabEnabled);
  }, []);

  // 焦点丢失时自动隐藏
  useEffect(() => {
    const unlisten = appWindow.onFocusChanged(({ payload: focused }) => {
      if (!focused) appWindow.hide();
    });
    return () => {
      unlisten.then((f) => f());
    };
  }, [appWindow]);

  // ==========================================
  // 🌟 核心魔法：DOM 驱动底层窗口自适应大小
  // ==========================================
  useEffect(() => {
    if (!cardRef.current) return;

    // 创建一个 ResizeObserver 来监听卡片的高度变化
    const observer = new ResizeObserver(async (entries) => {
      for (let entry of entries) {
        // 获取卡片纯内容的实际宽高
        const { width, height } = entry.borderBoxSize[0]
          ? {
              width: entry.borderBoxSize[0].inlineSize,
              height: entry.borderBoxSize[0].blockSize,
            }
          : entry.contentRect;

        // 因为最外层的容器有 p-3 (12px的内边距，上下左右一共24px) 留给阴影
        // 所以底层窗口的尺寸 = 卡片尺寸 + 24
        const targetWidth = width + 24;
        const targetHeight = height + 24;

        // 调用原生 API 实时收缩/扩张窗口
        await appWindow.setSize(new LogicalSize(targetWidth, targetHeight));
      }
    });

    observer.observe(cardRef.current);

    return () => observer.disconnect();
  }, [appWindow]);

  const openMainWindow = async () => {
    const mainWindow = await Window.getByLabel("main");
    if (mainWindow) {
      await mainWindow.unminimize();
      await mainWindow.show();
      await mainWindow.setFocus();

      const fabWindow = await Window.getByLabel("fab");
      if (fabWindow) await fabWindow.hide();
    }
    await appWindow.hide();
  };

  const handleToggleFab = async () => {
    const newState = await invoke<boolean>("toggle_fab");
    setFabEnabled(newState);
  };

  const handleQuit = async () => {
    await exit(0);
  };

  return (
    <div className="h-screen w-screen p-3 flex flex-col overflow-hidden select-none bg-transparent cursor-default items-center">
      {/* 🌟 加上 ref，且固定一个合适的宽度（比如 w-56 就是 224px） */}
      <div
        ref={cardRef}
        className="w-56 bg-base-100/90 backdrop-blur-2xl border border-base-200/60 rounded-3xl shadow-2xl flex flex-col p-2 gap-1 relative overflow-hidden h-fit"
      >
        <div className="px-3 pt-2 pb-1 flex justify-between items-center">
          <span className="text-[10px] font-black tracking-widest text-base-content/40 uppercase">
            Momentary
          </span>
          <div className="w-2 h-2 rounded-full bg-primary/80 animate-pulse" />
        </div>

        <div className="mt-1 space-y-1">
          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-base-content/80 hover:text-primary hover:bg-primary/10 transition-colors"
            onClick={openMainWindow}
          >
            <div className="w-7 h-7 rounded-full bg-base-200/80 flex items-center justify-center shrink-0">
              <Plus className="w-4 h-4" />
            </div>
            新建事件
          </button>

          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-base-content/80 hover:text-base-content hover:bg-base-200/50 transition-colors"
            onClick={openMainWindow}
          >
            <div className="w-7 h-7 rounded-full bg-base-200/80 flex items-center justify-center shrink-0">
              <Maximize2 className="w-3.5 h-3.5" />
            </div>
            主控制台
          </button>

          <button
            className="w-full flex justify-between items-center px-3 py-2.5 rounded-xl hover:bg-base-200/50 transition-colors group"
            onClick={handleToggleFab}
          >
            <div className="flex items-center gap-3 text-sm font-bold text-base-content/80 group-hover:text-base-content whitespace-nowrap">
              <div className="w-7 h-7 rounded-full bg-base-200/80 flex items-center justify-center shrink-0">
                <Layers className="w-3.5 h-3.5" />
              </div>
              悬浮窗
            </div>

            <div
              className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 shrink-0 ${fabEnabled ? "bg-primary" : "bg-base-300"}`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${fabEnabled ? "translate-x-4" : "translate-x-0"}`}
              />
            </div>
          </button>
        </div>

        <div className="border-t border-base-200/50 pt-1 mt-1">
          <button
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-base-content/50 hover:text-error hover:bg-error/10 transition-colors"
            onClick={handleQuit}
          >
            <X className="w-3.5 h-3.5 shrink-0" />
            彻底退出
          </button>
        </div>
      </div>
    </div>
  );
}
