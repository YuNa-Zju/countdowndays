import { Settings, Moon, Sun, Monitor, Zap, CheckCircle2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { useUiBus } from "../store/uiBus";

export default function UserMenu() {
  const { theme, setTheme, autoCheckUpdate, setAutoCheckUpdate } = useUiBus();

  // 🌟 1. 创建一个引用，用来指向这个菜单
  const dropdownRef = useRef<HTMLDetailsElement>(null);

  // 🌟 2. 添加全局点击监听：如果点的地方不在菜单里面，就强制关掉它
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 检查 ref 是否存在，并且点击的目标 (event.target) 不在 dropdownRef 内部
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        // 强行移除 open 属性，菜单就会丝滑收起
        dropdownRef.current.removeAttribute("open");
      }
    };

    // 监听鼠标按下事件
    document.addEventListener("mousedown", handleClickOutside);

    // 组件卸载时记得清理监听器，防止内存泄漏
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  // 🌟 三态循环切换逻辑
  const cycleTheme = () => {
    if (theme === "pastel-light") setTheme("pastel-dark");
    else if (theme === "pastel-dark") setTheme("system");
    else setTheme("pastel-light");
  };

  const iconTransitionClass =
    "absolute inset-0 m-auto w-5 h-5 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]";

  return (
    <details ref={dropdownRef} className="dropdown dropdown-end font-sans">
      {/* 触发按钮：干掉焦点轮廓 */}
      <summary className="btn btn-ghost btn-circle m-1 hover:bg-base-200 transition-colors outline-none focus:outline-none [-webkit-tap-highlight-color:transparent]">
        <Settings className="w-5 h-5 text-base-content/70" />
      </summary>

      <ul className="dropdown-content z-50 menu p-4 shadow-2xl bg-base-100/95 backdrop-blur-md rounded-2xl w-72 border border-base-200/50 mt-2 flex flex-col gap-2">
        {/* --- 🌟 模块一：炫酷主题切换 --- */}
        <li className="bg-base-200/50 rounded-xl overflow-hidden">
          <button
            onClick={cycleTheme}
            className="flex items-center justify-between w-full p-3 h-14 hover:bg-base-200 transition-colors relative overflow-hidden group active:scale-[0.98] outline-none focus:outline-none [-webkit-tap-highlight-color:transparent]"
          >
            <div className="flex flex-col items-start">
              <span className="font-bold text-sm">外观模式</span>
              <span className="text-xs text-base-content/50 font-medium">
                {theme === "pastel-light"
                  ? "当前：浅色"
                  : theme === "pastel-dark"
                    ? "当前：深色"
                    : "当前：跟随系统"}
              </span>
            </div>

            <div className="relative w-10 h-10 bg-base-100 rounded-full shadow-sm group-hover:shadow-md transition-all border border-base-200 mr-1">
              <Sun
                className={`${iconTransitionClass} ${
                  theme === "pastel-light"
                    ? "opacity-100 rotate-0 scale-100 text-yellow-500"
                    : "opacity-0 -rotate-90 scale-50 text-base-content/30"
                }`}
              />
              <Moon
                className={`${iconTransitionClass} ${
                  theme === "pastel-dark"
                    ? "opacity-100 rotate-0 scale-100 text-blue-400"
                    : "opacity-0 rotate-90 scale-50 text-base-content/30"
                }`}
              />
              <Monitor
                className={`${iconTransitionClass} ${
                  theme === "system"
                    ? "opacity-100 rotate-0 scale-100 text-purple-400"
                    : "opacity-0 rotate-180 scale-50 text-base-content/30"
                }`}
              />
            </div>
          </button>
        </li>

        <div className="divider my-1 opacity-20 px-2"></div>

        {/* --- 🌟 模块二：显眼的更新开关 --- */}
        <li className="bg-primary/5 rounded-xl border border-primary/10 overflow-hidden">
          <label className="label cursor-pointer flex items-center justify-between w-full p-3 h-14 hover:bg-primary/10 transition-colors active:scale-[0.98] outline-none focus:outline-none [-webkit-tap-highlight-color:transparent]">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-full transition-colors ${
                  autoCheckUpdate
                    ? "bg-primary text-primary-content shadow-primary/30 shadow-lg"
                    : "bg-base-300 text-base-content/40"
                }`}
              >
                {autoCheckUpdate ? (
                  <Zap className="w-4 h-4 animate-pulse" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
              </div>
              <div className="flex flex-col">
                <span
                  className={`font-bold text-sm transition-colors ${
                    autoCheckUpdate ? "text-primary" : "text-base-content"
                  }`}
                >
                  自动检查更新
                </span>
                <span className="text-xs text-base-content/50 font-medium">
                  {autoCheckUpdate ? "启动时自动发现新版本" : "我想手动检查"}
                </span>
              </div>
            </div>

            {/* 🌟 核心修复：手搓纯 div 开关，彻底抛弃原生 input 的渲染 */}
            <div className="relative inline-flex items-center ml-2">
              <input
                type="checkbox"
                className="sr-only" // sr-only 会把它在视觉上彻底抹除，但保留点击功能
                checked={autoCheckUpdate}
                onChange={(e) => setAutoCheckUpdate(e.target.checked)}
              />
              {/* 开关背景槽 */}
              <div
                className={`w-11 h-6 rounded-full transition-colors duration-300 ease-in-out shadow-inner ${
                  autoCheckUpdate ? "bg-primary" : "bg-base-300"
                }`}
              >
                {/* 开关滑块小白圆点 */}
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                    autoCheckUpdate ? "translate-x-5" : "translate-x-0"
                  }`}
                ></div>
              </div>
            </div>
          </label>
        </li>

        <li className="text-[10px] text-center text-base-content/30 mt-1 font-medium tracking-widest uppercase">
          Momentary Desktop
        </li>
      </ul>
    </details>
  );
}
