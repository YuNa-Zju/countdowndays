import { useState } from "react";
import { Sparkles, DownloadCloud, X, ChevronRight, Info } from "lucide-react";
import { useUiBus } from "../store/uiBus";
import { relaunch } from "@tauri-apps/plugin-process";
import ReactMarkdown from "react-markdown";

export default function UpdateModal() {
  const { isUpdateModalOpen, closeUpdateModal, updateInfo } = useUiBus();
  const [isUpdating, setIsUpdating] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!isUpdateModalOpen || !updateInfo) return null;

  const handleUpdate = async () => {
    setIsUpdating(true);
    let downloaded = 0;
    let contentLength = 0;

    try {
      await updateInfo.downloadAndInstall((event) => {
        switch (event.event) {
          case "Started":
            contentLength = event.data.contentLength || 0;
            break;
          case "Progress":
            downloaded += event.data.chunkLength;
            if (contentLength > 0) {
              setProgress(Math.round((downloaded / contentLength) * 100));
            }
            break;
          case "Finished":
            setProgress(100);
            break;
        }
      });
      await relaunch();
    } catch (error) {
      console.error("更新过程发生错误:", error);
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center p-4 animate-in fade-in duration-500">
      <div className="absolute inset-0 bg-base-300/40 backdrop-blur-xl" />

      <div className="relative w-full max-w-lg bg-base-100/80 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] border border-white/10 overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-10 duration-700">
        <div className="absolute top-0 left-0 right-0 h-48 bg-linear-to-b from-primary/15 to-transparent pointer-events-none" />

        {/* 头部区域 */}
        <div className="relative pt-10 px-10 pb-4 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-base-100 border border-base-300 shadow-xl rounded-2xl flex items-center justify-center mb-4 relative">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          </div>

          <h2 className="text-xl font-black text-base-content tracking-tight mb-2">
            {isUpdating ? "正在升级系统" : "发现新版本"}
          </h2>

          <div className="flex items-center gap-2 bg-primary/10 border border-primary/10 px-3 py-1 rounded-full">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">
              Momentary
            </span>
            <ChevronRight className="w-3 h-3 text-primary/30" />
            <span className="text-xs font-bold text-primary">
              {updateInfo.version}
            </span>
          </div>
        </div>

        {/* 🌟 优化后的渐变分界线 */}
        <div className="relative px-12 py-2">
          <div className="h-px w-full bg-linear-to-r from-transparent via-base-content/10 to-transparent" />
        </div>

        {/* 🌟 更新内容展示区：字体变大，背景加深 */}
        <div className="relative px-8 py-4">
          <div className="bg-base-200/60 rounded-3xl border border-base-300/30 p-6 max-h-80 overflow-y-auto custom-scrollbar-thin">
            <div className="flex items-center gap-2 mb-4 text-base-content/30">
              <Info className="w-3.5 h-3.5" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">
                Changelog
              </span>
            </div>

            {/* 🌟 内容字体调整：正文 text-[15px]，标题缩小 */}
            <div className="text-[15px] leading-relaxed text-base-content/90 font-medium">
              <ReactMarkdown
                components={{
                  // 缩小了 Markdown 内的标题
                  h1: (props) => (
                    <h1
                      className="text-lg font-black mt-4 mb-3 text-base-content"
                      {...props}
                    />
                  ),
                  h2: (props) => (
                    <h2
                      className="text-base font-black mt-4 mb-2 text-base-content"
                      {...props}
                    />
                  ),
                  p: (props) => <p className="mb-4 last:mb-0" {...props} />,
                  ul: (props) => (
                    <ul className="list-none space-y-2.5 mb-4" {...props} />
                  ),
                  li: (props) => (
                    <li className="flex gap-2.5 items-start" {...props}>
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                      <span>{props.children}</span>
                    </li>
                  ),
                  strong: (props) => (
                    <strong className="font-bold text-primary" {...props} />
                  ),
                  code: (props) => (
                    <code
                      className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-md text-xs font-mono"
                      {...props}
                    />
                  ),
                  // 优化的 Markdown 内分界线
                  hr: () => (
                    <hr className="my-6 border-0 h-px bg-linear-to-r from-transparent via-base-content/5 to-transparent" />
                  ),
                }}
              >
                {updateInfo.body ||
                  "✨ 带来了多项性能改进与视觉优化，建议立即更新。"}
              </ReactMarkdown>
            </div>
          </div>
        </div>

        {/* 底部交互区 */}
        <div className="relative p-8 pt-4 flex flex-col gap-6">
          {isUpdating ? (
            <div className="flex flex-col gap-4 py-2">
              <div className="flex justify-between items-end px-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">
                  Downloading...
                </span>
                <span className="text-xl font-black tabular-nums text-primary">
                  {progress}%
                </span>
              </div>
              <div className="w-full bg-base-300/50 rounded-full h-3 overflow-hidden border border-base-300/50">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex gap-4">
              <button
                onClick={closeUpdateModal}
                className="flex-1 py-4 rounded-2xl font-bold text-sm text-base-content/30 hover:text-base-content/60 hover:bg-base-200/50 transition-all"
              >
                稍后再说
              </button>
              <button
                onClick={handleUpdate}
                className="flex-2 flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-sm text-primary-content bg-primary shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:scale-95 transition-all"
              >
                <DownloadCloud className="w-5 h-5" />
                立即无感更新
              </button>
            </div>
          )}
        </div>

        {/* 关闭按钮 */}
        {!isUpdating && (
          <button
            onClick={closeUpdateModal}
            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-xl text-base-content/20 hover:text-base-content/50 hover:bg-base-200 transition-all group"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .custom-scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(var(--bc), 0.08);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
