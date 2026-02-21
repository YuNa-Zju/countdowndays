import { motion } from "framer-motion";
import { MoreHorizontal } from "lucide-react";
import {
  intervalToDuration,
  isBefore,
  format,
  differenceInDays,
} from "date-fns";
import { useUiBus } from "../store/uiBus";
import { AppEvent } from "../types";

interface EventCardProps {
  event: AppEvent;
}

export default function EventCard({ event }: EventCardProps) {
  const { openContextMenu } = useUiBus();

  const targetDate = new Date(event.target_date);
  const now = new Date();
  const isPast = isBefore(targetDate, now);

  const duration = intervalToDuration({
    start: isPast ? targetDate : now,
    end: isPast ? now : targetDate,
  });

  const years = duration.years || 0;
  const months = duration.months || 0;
  const days = duration.days || 0;

  let displayTime = "";
  if (years > 0) displayTime += `${years}年 `;
  if (months > 0) displayTime += `${months}个月 `;
  if (days > 0 || displayTime === "") displayTime += `${days}天`;

  const totalDaysDiff = Math.abs(differenceInDays(targetDate, now));
  const maxDays = 365;
  const progressValue = isPast ? maxDays : Math.max(0, maxDays - totalDaysDiff);

  // 重要性视觉映射（右侧彩色标记）
  // 分数越高，hsl 里的亮度越低（颜色越深），色相偏向于红色(348)
  const importanceColor = `hsl(348, ${50 + event.importance / 2}%, ${90 - event.importance / 1.5}%)`;

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止冒泡
    // 获取鼠标点击位置作为菜单弹出的锚点
    openContextMenu(e.clientX - 100, e.clientY + 20, event.id);
  };

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden relative group"
    >
      {/* 顶部的极细重要性彩色指示条 */}
      <div
        className="absolute top-0 left-0 w-full h-1"
        style={{ backgroundColor: importanceColor }}
      />

      <div className="card-body p-5 pt-6">
        <div className="flex justify-between items-start mb-2">
          <h2 className="card-title text-lg truncate pr-2">{event.title}</h2>

          {/* 横向的三个点，点击触发全局菜单 */}
          <button
            onClick={handleMenuClick}
            className="btn btn-sm btn-circle btn-ghost -mr-2 text-base-content/50 hover:text-base-content transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-base-content/60 line-clamp-2 min-h-[2.5rem]">
          {event.description}
        </p>

        <div className="mt-4 flex items-end justify-between">
          <div className="text-primary font-black text-3xl md:text-4xl tracking-tight">
            {displayTime}
            {isPast && (
              <span className="text-sm font-normal text-base-content/50 ml-1">
                前
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-1">
          <div className="flex justify-between text-xs text-base-content/50 font-medium">
            <div className="flex items-center gap-2">
              <span className="badge badge-outline border-base-300 text-[10px] uppercase">
                {event.category}
              </span>
              <span className="opacity-70">重要度 {event.importance}</span>
            </div>
            <span>{format(targetDate, "yyyy/MM/dd")}</span>
          </div>
          <progress
            className={`progress w-full h-1.5 ${isPast ? "progress-error" : "progress-primary"}`}
            value={progressValue}
            max={maxDays}
          ></progress>
        </div>
      </div>
    </motion.div>
  );
}
