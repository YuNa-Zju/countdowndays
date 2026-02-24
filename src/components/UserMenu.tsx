import {
  Settings,
  Moon,
  Sun,
  Monitor,
  Zap,
  CheckCircle2,
  Info,
  RefreshCw,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useUiBus } from "../store/uiBus";
import { getVersion } from "@tauri-apps/api/app";
import { check } from "@tauri-apps/plugin-updater";
import { AnimatePresence, motion } from "framer-motion";

export default function UserMenu() {
  const {
    theme,
    setTheme,
    autoCheckUpdate,
    setAutoCheckUpdate,
    openUpdateModal,
  } = useUiBus();
  const [appVersion, setAppVersion] = useState<string>("0.0.0");

  // 状态控制：更新检查中 | 已是最新
  const [updateStatus, setUpdateStatus] = useState<
    "idle" | "checking" | "latest"
  >("idle");
  const [showAbout, setShowAbout] = useState(false);

  const dropdownRef = useRef<HTMLDetailsElement>(null);

  // 获取版本号
  useEffect(() => {
    getVersion().then(setAppVersion);
  }, []);

  // 🌟 1. 核心修复：监听 Esc 键关闭弹窗
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowAbout(false);
    };
    if (showAbout) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showAbout]);

  // 点击外部收起菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        dropdownRef.current.removeAttribute("open");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🌟 2. 增强版手动检查更新逻辑
  const handleManualCheck = async () => {
    if (updateStatus !== "idle") return;

    setUpdateStatus("checking");
    try {
      const update = await check();
      if (update) {
        openUpdateModal(update);
        setUpdateStatus("idle");
      } else {
        // 无更新，展示反馈状态
        setUpdateStatus("latest");
        setTimeout(() => setUpdateStatus("idle"), 2500);
      }
    } catch (error) {
      console.error("更新检查失败:", error);
      setUpdateStatus("idle");
    }
  };

  const cycleTheme = () => {
    if (theme === "pastel-light") setTheme("pastel-dark");
    else if (theme === "pastel-dark") setTheme("system");
    else setTheme("pastel-light");
  };

  const iconClass =
    "absolute inset-0 m-auto w-5 h-5 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]";

  return (
    <>
      <details ref={dropdownRef} className="dropdown dropdown-end font-sans">
        <summary className="btn btn-ghost btn-circle m-1 hover:bg-base-200 outline-none focus:outline-none [-webkit-tap-highlight-color:transparent]">
          <Settings className="w-5 h-5 text-base-content/70" />
        </summary>

        <ul className="dropdown-content z-50 menu p-2 shadow-2xl bg-base-100/95 backdrop-blur-md rounded-2xl w-64 border border-base-200/50 mt-2 flex flex-col gap-1">
          {/* 条目一：主题切换 */}
          <li>
            <button
              onClick={cycleTheme}
              className="flex justify-between h-12 active:bg-base-200 group"
            >
              <span className="font-bold text-sm">外观模式</span>
              <div className="relative w-8 h-8 bg-base-200 rounded-full border border-base-300 group-hover:scale-110 transition-transform">
                <Sun
                  className={`${iconClass} ${theme === "pastel-light" ? "opacity-100 rotate-0 scale-100 text-yellow-500" : "opacity-0 -rotate-90 scale-50"}`}
                />
                <Moon
                  className={`${iconClass} ${theme === "pastel-dark" ? "opacity-100 rotate-0 scale-100 text-blue-400" : "opacity-0 rotate-90 scale-50"}`}
                />
                <Monitor
                  className={`${iconClass} ${theme === "system" ? "opacity-100 rotate-0 scale-100 text-purple-400" : "opacity-0 rotate-180 scale-50"}`}
                />
              </div>
            </button>
          </li>

          {/* 条目二：自动更新开关 */}
          <li>
            <label className="flex justify-between h-12 cursor-pointer active:bg-base-200">
              <span className="font-bold text-sm">自动检查更新</span>
              <div className="relative inline-flex items-center">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={autoCheckUpdate}
                  onChange={(e) => setAutoCheckUpdate(e.target.checked)}
                />
                <div
                  className={`w-10 h-5 rounded-full transition-colors ${autoCheckUpdate ? "bg-primary" : "bg-base-300"}`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${autoCheckUpdate ? "translate-x-5" : "translate-x-0"}`}
                  />
                </div>
              </div>
            </label>
          </li>

          <div className="divider my-0 opacity-10"></div>

          {/* 条目三：检查更新 (动态状态反馈) */}
          <li>
            <button
              onClick={handleManualCheck}
              className="flex justify-between h-12 active:bg-base-200"
            >
              <div className="flex items-center gap-3">
                <RefreshCw
                  className={`w-4 h-4 text-base-content/50 ${updateStatus === "checking" ? "animate-spin" : ""}`}
                />
                <span className="text-sm font-medium">
                  {updateStatus === "latest" ? "已是最新版本" : "检查更新"}
                </span>
              </div>
              {updateStatus === "latest" && (
                <CheckCircle2 className="w-4 h-4 text-success animate-in zoom-in" />
              )}
            </button>
          </li>

          {/* 条目四：关于 */}
          <li>
            <button
              onClick={() => setShowAbout(true)}
              className="flex gap-3 h-12 active:bg-base-200"
            >
              <Info className="w-4 h-4 text-base-content/50" />
              <span className="text-sm font-medium">关于 Momentary</span>
            </button>
          </li>
        </ul>
      </details>

      {/* --- 🌟 关于 Momentary 弹窗 (Modal) --- */}
      <AnimatePresence>
        {showAbout && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAbout(false)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />

            {/* 弹窗主体 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-base-100 shadow-2xl rounded-[3rem] p-10 border border-base-200 flex flex-col items-center text-center"
            >
              <button
                onClick={() => setShowAbout(false)}
                className="absolute top-6 right-8 btn btn-ghost btn-circle btn-sm"
              >
                <X className="w-5 h-5 opacity-30" />
              </button>

              <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner">
                <Zap className="w-10 h-10 text-primary" />
              </div>

              <h2 className="text-3xl font-black tracking-tighter mb-1">
                Momentary
              </h2>
              <div className="badge badge-primary badge-outline font-mono font-bold mb-6">
                v{appVersion}
              </div>

              <p className="text-sm text-base-content/60 leading-relaxed mb-10 px-4">
                一款专注于优雅与宁静的倒数日管理工具。
                <br />
                每一刻的等待，都是为了更好的重逢。
              </p>

              <div className="w-full pt-6 border-t border-base-200 flex flex-col gap-1">
                <div className="flex items-center justify-center gap-1.5 text-primary/40 mb-1">
                  <span className="text-[10px] font-bold tracking-[0.3em] uppercase">
                    Created by YuNa
                  </span>
                </div>
                <span className="text-[9px] opacity-20 font-medium">
                  © 2026 Momentary Studio
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
