import { ExternalLink } from "lucide-react";

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
                onClick={(e) => e.stopPropagation()}
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
