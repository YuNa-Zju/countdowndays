import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  MoreHorizontal,
  CalendarHeart,
  History,
  AlignLeft,
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
// 复用刚才写好的解析器
import renderDescription from "../utils/textUtils";

interface EventCardProps {
  event: AppEvent;
}

export default function EventCard({ event }: EventCardProps) {
  const { openContextMenu, openNoteModal } = useUiBus();
  const { deleteEventOptimistic } = useEventStore();

  const today = startOfDay(new Date());
  const originalTarget = startOfDay(new Date(event.target_date));
  // 读取真实创建时间（带 fallback 防止报错）
  const createdAt = event.created_at
    ? startOfDay(new Date(event.created_at))
    : today;

  const isAnniversary = event.event_type === "anniversary";

  let displayDays = 0;
  let isPast = false;
  let prefixText = "";
  let elapsedText = "";
  let targetDisplayDate = originalTarget;
  let progressPercentage = 0; // 进度条百分比

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

    // 纪念日进度条：按原来一样的 365 天倒数算法
    progressPercentage = ((365 - displayDays) / 365) * 100;
  } else {
    isPast =
      isBefore(originalTarget, today) && !isSameDay(originalTarget, today);
    displayDays = Math.abs(differenceInDays(originalTarget, today));
    prefixText = isPast ? "PAST" : "LEFT";

    if (isPast) {
      progressPercentage = 100;
      useEffect(() => {
        const timer = setTimeout(() => deleteEventOptimistic(event.id), 2000);
        return () => clearTimeout(timer);
      }, []);
    } else {
      // 🌟 任务进度条：(今天 - 创建时间) / (目标时间 - 创建时间)
      const totalDuration = differenceInDays(originalTarget, createdAt);
      const daysPassed = differenceInDays(today, createdAt);

      if (totalDuration <= 0) {
        progressPercentage = 100;
      } else {
        progressPercentage = (daysPassed / totalDuration) * 100;
      }
    }
  }

  // 限制进度条显示范围在 5% - 100% 之间，保证 UI 美观
  const finalProgress = Math.max(5, Math.min(100, progressPercentage));
  const importanceColor = `hsl(348, ${50 + (event.importance * 10) / 2}%, ${65 - (event.importance * 10) / 3}%)`;

  return (
    <motion.div
      layout="position"
      className={`card shadow-sm border border-base-200 overflow-visible relative group h-full flex flex-col transition-all duration-300 rounded-3xl
        ${isAnniversary ? "bg-info/10 hover:bg-info/15" : "bg-warning/10 hover:bg-warning/15"}`}
    >
      <div className="card-body p-5 flex flex-col flex-1">
        {/* 顶部：类型胶囊、自定义标签与操作 */}
        <div className="flex justify-between items-start mb-4 gap-2">
          <div className="flex flex-wrap gap-2 flex-1 items-center">
            {/* 主类型标签 */}
            <span
              className={`badge badge-md rounded-full font-black border-none text-[10px] tracking-widest uppercase py-2.5 px-3 shadow-sm
              ${isAnniversary ? "bg-info text-info-content" : "bg-warning text-warning-content"}`}
            >
              {isAnniversary ? "Anniversary" : "Task"}
            </span>

            {/* 自定义分类标签 */}
            {event.categories.map((c) => (
              <span
                key={c.id}
                className="px-3 py-1 rounded-full bg-base-content/10 border border-base-content/10 text-[11px] font-bold text-base-content/80 uppercase tracking-tighter shadow-sm backdrop-blur-sm"
              >
                {c.name}
              </span>
            ))}
          </div>

          {/* 菜单按钮 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              openContextMenu(e.clientX - 100, e.clientY + 20, event.id);
            }}
            className="btn btn-sm btn-circle btn-ghost -mr-2 -mt-1 opacity-30 group-hover:opacity-100 transition-opacity shrink-0"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* 🌟 标题与自定义悬停浮窗 */}
        <div className="relative group/title mb-2 w-full">
          {/* break-all 解决 123123 这种长串数字不换行的问题，line-clamp-1 做单行截断 */}
          <h2 className="text-3xl font-black text-base-content tracking-tight line-clamp-1 break-all cursor-default">
            {event.title}
          </h2>

          {/* 漂亮的自定义浮窗：毛玻璃、阴影、滑入动画、长文本自动断行 */}
          <div className="absolute z-50 left-0 bottom-full mb-1 pointer-events-none opacity-0 group-hover/title:opacity-100 transition-all duration-300 translate-y-2 group-hover/title:translate-y-0">
            <div className="w-max max-w-65 bg-base-content/95 backdrop-blur-xl text-base-100 text-[13px] font-bold py-2.5 px-4 rounded-2xl shadow-2xl break-all whitespace-normal leading-relaxed border border-base-100/10">
              {event.title}
            </div>
          </div>
        </div>

        {event.description && (
          <div className="mb-2">
            <p className="text-base text-base-content/60 line-clamp-2 leading-relaxed break-all">
              {renderDescription(event.description)}
            </p>
            {event.description.length > 25 && (
              <button
                onClick={() => openNoteModal(event.title, event.description)}
                className="mt-1 flex items-center gap-1.5 text-sm font-bold text-primary hover:opacity-70 transition-opacity"
              >
                <AlignLeft className="w-4 h-4" /> 查看完整备注
              </button>
            )}
          </div>
        )}

        {isAnniversary && (
          <div className="mt-2 space-y-1.5 text-sm font-bold text-base-content/50 bg-base-100/40 p-3 rounded-2xl border border-base-content/5">
            <div className="flex items-center gap-2">
              <CalendarHeart className="w-4 h-4" />
              {format(originalTarget, "yyyy/MM/dd")} 开启
            </div>
            {elapsedText && (
              <div className="flex items-center gap-2">
                <History className="w-4 h-4" />
                已陪伴 {elapsedText}
              </div>
            )}
          </div>
        )}

        <div className="mt-auto pt-6">
          <div
            className={`font-black tracking-tighter flex items-baseline gap-2 ${displayDays === 0 ? "text-secondary" : "text-primary"}`}
          >
            <span className="text-sm font-black opacity-30 tracking-[0.2em]">
              {prefixText}
            </span>
            <span className="text-7xl">{displayDays}</span>
            <span className="text-2xl font-black">天</span>
          </div>
        </div>

        {/* 底部对齐的进度条与日期 */}
        <div className="mt-5 space-y-2">
          <div className="flex justify-end items-center">
            <span className="text-xs font-black opacity-40 whitespace-nowrap tracking-wider">
              {format(targetDisplayDate, "yyyy/MM/dd")}
            </span>
          </div>

          <div className="w-full h-3 bg-base-content/5 rounded-full overflow-hidden shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${finalProgress}%`,
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
