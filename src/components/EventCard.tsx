import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MoreHorizontal,
  CalendarHeart,
  History,
  ExternalLink,
} from "lucide-react";
import {
  isBefore,
  differenceInDays,
  setYear,
  isSameDay,
  startOfDay,
  format,
  intervalToDuration,
} from "date-fns";
import { useUiBus } from "../store/uiBus";
import { useEventStore } from "../store/eventStore";
import { AppEvent } from "../types";

// 🌟 链接解析：保持点击在新窗口打开
const renderDescription = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline inline-flex items-center gap-0.5 hover:opacity-80"
          onClick={(e) => e.stopPropagation()}
        >
          链接 <ExternalLink className="w-3 h-3" />
        </a>
      );
    }
    return part;
  });
};

interface EventCardProps {
  event: AppEvent;
}

export default function EventCard({ event }: EventCardProps) {
  const { openContextMenu } = useUiBus();
  const { deleteEventOptimistic } = useEventStore();

  // 🌟 悬浮窗状态逻辑：支持鼠标移入弹窗不消失
  const [showTooltip, setShowTooltip] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    // 给一点延迟，方便用户将鼠标从文字移到弹窗上
    timeoutRef.current = window.setTimeout(() => {
      setShowTooltip(false);
    }, 200);
  };

  const today = startOfDay(new Date());
  const originalTarget = startOfDay(new Date(event.target_date));
  const isAnniversary = event.event_type === "anniversary";

  let displayDays = 0;
  let isPast = false;
  let prefixText = "";
  let elapsedText = "";
  let targetDisplayDate = originalTarget;

  if (isAnniversary) {
    if (isBefore(originalTarget, today) || isSameDay(originalTarget, today)) {
      const dur = intervalToDuration({ start: originalTarget, end: today });
      elapsedText = `${dur.years || 0}年${dur.months || 0}月${dur.days || 0}天`;
    }
    let nextAnniv = setYear(originalTarget, today.getFullYear());
    if (isBefore(nextAnniv, today) && !isSameDay(nextAnniv, today)) {
      nextAnniv = setYear(originalTarget, today.getFullYear() + 1);
    }
    displayDays = differenceInDays(nextAnniv, today);
    prefixText = "NEXT";
    targetDisplayDate = nextAnniv;
  } else {
    isPast =
      isBefore(originalTarget, today) && !isSameDay(originalTarget, today);
    displayDays = Math.abs(differenceInDays(originalTarget, today));
    prefixText = isPast ? "PAST" : "LEFT";
    if (isPast) {
      useEffect(() => {
        const timer = setTimeout(() => deleteEventOptimistic(event.id), 2000);
        return () => clearTimeout(timer);
      }, []);
    }
  }

  // 🌟 原本顶部的颜色现在被提取出来准备注入给进度条
  const importanceColor = `hsl(348, ${50 + event.importance / 2}%, ${65 - event.importance / 3}%)`;

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      /* 🌟 颜色方案：任务用 Warning 背景，纪念日用 Info 背景，在 Nord 下非常清晰 */
      className={`card shadow-sm border border-base-200 overflow-visible relative group h-full flex flex-col transition-all duration-300
        ${isAnniversary ? "bg-info/10 hover:bg-info/15" : "bg-warning/10 hover:bg-warning/15"}`}
    >
      <div className="card-body p-6 flex flex-col flex-1">
        {/* 顶部：类型胶囊与操作 */}
        <div className="flex justify-between items-start mb-4">
          <span
            className={`badge badge-lg rounded-full font-black border-none text-[10px] tracking-widest uppercase py-3 px-4
            ${isAnniversary ? "bg-info text-info-content" : "bg-warning text-warning-content"}`}
          >
            {isAnniversary ? "Anniversary" : "Task"}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openContextMenu(e.clientX - 100, e.clientY + 20, event.id);
            }}
            className="btn btn-sm btn-circle btn-ghost -mr-3 opacity-30 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        <h2 className="card-title text-2xl font-black text-base-content tracking-tight line-clamp-1 mb-1">
          {event.title}
        </h2>

        {/* 备注 & 交互式悬浮窗 */}
        <div
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <p className="text-base text-base-content/60 line-clamp-2 cursor-help">
            {renderDescription(event.description)}
          </p>
          <AnimatePresence>
            {showTooltip && event.description.length > 20 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="absolute z-[60] top-full left-0 mt-2 p-5 bg-base-100 border border-base-300 shadow-2xl rounded-2xl w-72 text-sm leading-relaxed text-base-content"
              >
                <div className="font-bold text-xs uppercase opacity-40 mb-2 tracking-widest">
                  备注详情
                </div>
                {renderDescription(event.description)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {isAnniversary && (
          <div className="mt-4 space-y-1 text-xs font-bold text-base-content/50 bg-base-100/40 p-3 rounded-2xl border border-base-content/5">
            <div className="flex items-center gap-2">
              <CalendarHeart className="w-3.5 h-3.5" />
              {format(originalTarget, "yyyy/MM/dd")} 开启
            </div>
            <div className="flex items-center gap-2">
              <History className="w-3.5 h-3.5" />
              已陪伴 {elapsedText}
            </div>
          </div>
        )}

        <div className="mt-auto pt-8">
          <div
            className={`font-black text-6xl tracking-tighter flex items-baseline gap-2 ${displayDays === 0 ? "text-secondary" : "text-primary"}`}
          >
            <span className="text-xs font-black opacity-30 tracking-[0.2em]">
              {prefixText}
            </span>
            {displayDays}
            <span className="text-2xl font-black">天</span>
          </div>
        </div>

        {/* 底部对齐的进度条与胶囊标签 */}
        <div className="mt-6 space-y-4">
          <div className="flex justify-between items-center gap-4">
            <div className="flex flex-wrap gap-2">
              {event.categories.map((c) => (
                <span
                  key={c.id}
                  className="px-4 py-1.5 rounded-full bg-base-100/60 border-none text-[10px] font-black text-base-content/50 uppercase tracking-tighter shadow-none"
                >
                  {c.name}
                </span>
              ))}
            </div>
            <span className="text-[10px] font-black opacity-20 whitespace-nowrap">
              {format(targetDisplayDate, "yyyy/MM/dd")}
            </span>
          </div>

          {/* 🌟 进度条：移除了原生样式的干扰，使用自定义颜色注入 */}
          <div className="w-full h-3 bg-base-content/5 rounded-full overflow-hidden shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.max(5, ((365 - displayDays) / 365) * 100)}%`,
              }}
              style={{ backgroundColor: importanceColor }}
              className="h-full rounded-full transition-all duration-1000"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
