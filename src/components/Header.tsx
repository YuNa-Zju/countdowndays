import { Search, Minus, Square, X } from "lucide-react";
import { useUiBus } from "../store/uiBus";
import ThemeToggle from "./ThemeToggle";
import { usePlatform } from "../hooks/usePlatform";
// Tauri v1 的 API (如果报错找不到 window，请先运行 npm install @tauri-apps/api)
import { getCurrentWindow } from "@tauri-apps/api/window";

export default function Header() {
  const { openCmdk } = useUiBus();
  const { isDesktop } = usePlatform();

  return (
    // 🌟 外层容器：data-tauri-drag-region 允许按住拖拽窗口
    <div
      data-tauri-drag-region
      className="bg-base-100 shadow-sm sticky top-0 z-50 flex flex-col select-none rounded-t-4xl"
    >
      {/* 🌟 桌面端专属：自定义标题栏控制按钮 */}
      {isDesktop && (
        <div
          data-tauri-drag-region
          className="flex justify-end items-center px-4 pt-2 pb-1 gap-2"
        >
          <button
            onClick={() => getCurrentWindow().minimize()}
            className="w-6 h-6 flex justify-center items-center rounded hover:bg-base-200 text-base-content/40 hover:text-base-content transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={() => getCurrentWindow().toggleMaximize()}
            className="w-6 h-6 flex justify-center items-center rounded hover:bg-base-200 text-base-content/40 hover:text-base-content transition-colors"
          >
            <Square className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => getCurrentWindow().close()}
            className="w-6 h-6 flex justify-center items-center rounded hover:bg-error hover:text-white text-base-content/40 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 🌟 原本的导航栏内容（稍微调整了 Padding） */}
      <div
        data-tauri-drag-region
        className={`navbar min-h-12 ${isDesktop ? "pb-2 pt-0" : "py-2"}`}
      >
        <div className="navbar-start"></div>
        <div
          data-tauri-drag-region
          className="navbar-center gap-2 pointer-events-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            className="w-9 h-9 drop-shadow-sm transition-transform hover:scale-105"
          >
            <rect
              x="36"
              y="72"
              width="440"
              height="408"
              rx="80"
              fill="#F0CD65"
            />
            <rect
              x="36"
              y="48"
              width="440"
              height="408"
              rx="80"
              fill="#FFFFFF"
            />
            <path
              d="M 36 190 L 36 128 A 80 80 0 0 1 116 48 L 396 48 A 80 80 0 0 1 476 128 L 476 190 Z"
              fill="#FF837A"
            />
            <circle cx="140" cy="110" r="22" fill="#F0CD65" />
            <circle cx="372" cy="110" r="22" fill="#F0CD65" />
            <rect
              x="116"
              y="16"
              width="48"
              height="104"
              rx="24"
              fill="#52D1C1"
            />
            <rect
              x="348"
              y="16"
              width="48"
              height="104"
              rx="24"
              fill="#52D1C1"
            />
            <rect x="128" y="24" width="16" height="88" rx="8" fill="#8BE4D8" />
            <rect x="360" y="24" width="16" height="88" rx="8" fill="#8BE4D8" />
            <g transform="translate(0, 40)">
              <circle
                cx="256"
                cy="256"
                r="96"
                fill="none"
                stroke="#4A4E69"
                strokeWidth="36"
                strokeLinecap="round"
              />
              <path
                d="M 256 200 L 256 256 L 296 286"
                fill="none"
                stroke="#4A4E69"
                strokeWidth="36"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <path
              d="M 410 260 Q 425 260 425 245 Q 425 260 440 260 Q 425 260 425 275 Q 425 260 410 260 Z"
              fill="#F0CD65"
            />
            <path
              d="M 80 340 Q 95 340 95 325 Q 95 340 110 340 Q 95 340 95 355 Q 95 340 80 340 Z"
              fill="#52D1C1"
            />
          </svg>
          <a className="text-xl font-black text-base-content tracking-tighter">
            倒数日
          </a>
        </div>
        <div className="navbar-end gap-3">
          <button
            onClick={openCmdk}
            className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-base-200 hover:bg-base-300 rounded-full transition-colors border border-base-300 shadow-inner"
          >
            <Search className="w-4 h-4 text-base-content/50" />
            <span className="text-sm text-base-content/60 font-bold tracking-widest uppercase">
              搜索...
            </span>
            <kbd className="ml-4 font-sans text-xs bg-base-100 px-1.5 py-0.5 rounded shadow-sm text-base-content/50 border border-base-200">
              ⌘K
            </kbd>
          </button>

          <button
            onClick={openCmdk}
            className="btn btn-ghost btn-circle md:hidden"
          >
            <Search className="w-5 h-5 text-base-content/70" />
          </button>

          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
