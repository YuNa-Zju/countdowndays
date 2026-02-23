import { ExternalLink } from "lucide-react";
import { open } from "@tauri-apps/plugin-shell";
export default function renderDescription(text: string) {
  return text.split("\n").map((line, lineIndex) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = line.split(urlRegex);
    return (
      <span key={lineIndex}>
        {parts.map((part, i) => {
          if (part.match(urlRegex)) {
            return (
              <a
                key={i}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline inline-flex items-center gap-1 hover:opacity-80 break-all"
                onClick={async (e) => {
                  // 🌟 核心修复：阻止 a 标签的默认 Webview 跳转行为
                  e.preventDefault();
                  e.stopPropagation();
                  // 🌟 调用系统底层 API，强制在用户的默认浏览器（如 Safari/Chrome）中打开该链接
                  await open(part);
                }}
              >
                {part} <ExternalLink className="w-3 h-3 inline" />
              </a>
            );
          }
          return <span key={i}>{part}</span>;
        })}
        <br />
      </span>
    );
  });
}
