import { useState } from "react";
import {
  Sparkles,
  DownloadCloud,
  X,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useUiBus } from "../store/uiBus";
import { relaunch } from "@tauri-apps/plugin-process";

export default function UpdateModal() {
  const { isUpdateModalOpen, closeUpdateModal, updateInfo } = useUiBus();

  // 🌟 新增状态：控制下载过程和进度条
  const [isUpdating, setIsUpdating] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!isUpdateModalOpen || !updateInfo) return null;

  // 🌟 核心引擎：执行真实的下载、替换和重启
  const handleUpdate = async () => {
    setIsUpdating(true);
    let downloaded = 0;
    let contentLength = 0;

    try {
      // 调用底层 API，并监听下载流
      await updateInfo.downloadAndInstall((event) => {
        switch (event.event) {
          case "Started":
            contentLength = event.data.contentLength || 0;
            break;
          case "Progress":
            downloaded += event.data.chunkLength;
            if (contentLength > 0) {
              // 计算真实百分比
              setProgress(Math.round((downloaded / contentLength) * 100));
            }
            break;
          case "Finished":
            setProgress(100);
            break;
        }
      });

      // 下载并覆盖完成后，命令系统平滑重启应用程序！
      await relaunch();
    } catch (error) {
      console.error("更新过程发生错误:", error);
      setIsUpdating(false); // 失败了允许用户重试
    }
  };

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-base-300/60 backdrop-blur-md" />

      <div className="relative w-full max-w-md bg-base-100/95 backdrop-blur-2xl rounded-4xl shadow-2xl border border-base-200/50 overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
        <div className="absolute top-0 left-0 right-0 h-32 bg-linear-to-b from-primary/10 to-transparent pointer-events-none" />
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/20 blur-3xl rounded-full pointer-events-none" />

        <div className="relative pt-8 px-8 pb-4 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-base-100 border border-base-200 shadow-lg rounded-2xl flex items-center justify-center mb-4 relative">
            <Sparkles className="w-8 h-8 text-primary" />
            {!isUpdating && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
              </span>
            )}
          </div>
          <h2 className="text-2xl font-black text-base-content tracking-tight mb-1">
            {isUpdating ? "正在跃迁至新版本..." : "发现新版本！"}
          </h2>
          <div className="inline-flex items-center gap-2 bg-base-200/50 px-3 py-1 rounded-full text-sm font-bold text-base-content/60">
            <span>当前版本</span>
            <ChevronRight className="w-3 h-3 opacity-50" />
            <span className="text-primary">{updateInfo.version}</span>
          </div>
        </div>

        <div className="relative px-8 py-2 max-h-40 overflow-y-auto custom-scrollbar">
          <div className="space-y-3 text-sm text-base-content/70 font-medium whitespace-pre-wrap">
            {updateInfo.body || "✨ 优化了大量细节，建议立即体验！"}
          </div>
        </div>

        {/* 底部操作区 / 进度条区 */}
        <div className="relative p-6 mt-4 bg-base-200/30">
          {isUpdating ? (
            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-xs font-bold text-base-content/60">
                <span>下载进度</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-base-300 rounded-full h-3 overflow-hidden shadow-inner">
                <div
                  className="bg-primary h-3 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
              <p className="text-center text-xs text-base-content/40 mt-1 font-medium">
                更新完成后将自动重启，请不要关闭程序
              </p>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={closeUpdateModal}
                className="flex-1 py-3.5 rounded-xl font-bold text-base-content/60 hover:text-base-content hover:bg-base-200 transition-colors"
              >
                稍后再说
              </button>
              <button
                onClick={handleUpdate}
                className="flex-2 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-primary-content bg-primary shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <DownloadCloud className="w-5 h-5" />
                立即无感更新
              </button>
            </div>
          )}
        </div>

        {/* 右上角关闭按钮 (更新时禁用) */}
        {!isUpdating && (
          <button
            onClick={closeUpdateModal}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-base-200/50 text-base-content/50 hover:text-base-content hover:bg-base-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
