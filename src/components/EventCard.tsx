import { useEffect } from "react";
import { motion } from "framer-motion";
import { MoreHorizontal } from "lucide-react";
import {
  isBefore,
  differenceInDays,
  setYear,
  isSameDay,
  startOfDay,
  format,
} from "date-fns";
import { useUiBus } from "../store/uiBus";
import { useEventStore } from "../store/eventStore";
import { AppEvent } from "../types";

interface EventCardProps {
  event: AppEvent;
}

export default function EventCard({ event }: EventCardProps) {
  const { openContextMenu } = useUiBus();
  const { deleteEventOptimistic } = useEventStore();

  // 消除时分秒的干扰，全按“今天 00:00”来算
  const today = startOfDay(new Date());
  const originalTarget = startOfDay(new Date(event.target_date));

  let displayDays = 0;
  let isPast = false;
  let prefixText = "";
  let targetDisplayDate = originalTarget;

  if (event.event_type === "anniversary") {
    // 🎂【纪念日逻辑】：寻找下一次该日期
    let nextAnniversary = setYear(originalTarget, today.getFullYear());
    // 如果今年的已经过去了（且不是今天），就拨到明年
    if (
      isBefore(nextAnniversary, today) &&
      !isSameDay(nextAnniversary, today)
    ) {
      nextAnniversary = setYear(originalTarget, today.getFullYear() + 1);
    }
    displayDays = differenceInDays(nextAnniversary, today);
    prefixText = displayDays === 0 ? "今天" : "距离下一次";
    targetDisplayDate = nextAnniversary; // 进度条按下一个周期算
  } else {
    // 📝【任务逻辑】：一次性
    isPast =
      isBefore(originalTarget, today) && !isSameDay(originalTarget, today);
    displayDays = Math.abs(differenceInDays(originalTarget, today));
    prefixText = isPast ? "已过期" : displayDays === 0 ? "今天" : "还剩";
    targetDisplayDate = originalTarget;

    // 【自动删除逻辑】：如果是任务且已过期，触发清理（延迟 1 秒执行避免渲染冲突）
    useEffect(() => {
      if (isPast) {
        const timer = setTimeout(() => deleteEventOptimistic(event.id), 1000);
        return () => clearTimeout(timer);
      }
    }, [isPast, event.id, deleteEventOptimistic]);
  }

  // 进度条逻辑 (纪念日按365天算满，任务也暂定365天视觉)
  const maxDays = 365;
  const progressValue = isPast ? maxDays : Math.max(0, maxDays - displayDays);

  const importanceColor = `hsl(348, ${50 + event.importance / 2}%, ${90 - event.importance / 1.5}%)`;

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openContextMenu(e.clientX - 100, e.clientY + 20, event.id);
  };

  // 如果是任务且过期了，因为 useEffect 会在1秒后删掉它，我们可以给它个渐渐消失的状态
  if (event.event_type === "task" && isPast) {
    return null; // 或者保留视觉效果，等待 useEffect 自动销毁
  }

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden relative group"
    >
      <div
        className="absolute top-0 left-0 w-full h-1"
        style={{ backgroundColor: importanceColor }}
      />

      <div className="card-body p-5 pt-6">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2 pr-2 overflow-hidden">
            <span
              className={`badge badge-sm border-none shrink-0 ${event.event_type === "anniversary" ? "bg-secondary/20 text-secondary" : "bg-primary/20 text-primary"}`}
            >
              {event.event_type === "anniversary" ? "纪念" : "任务"}
            </span>
            <h2 className="card-title text-lg truncate">{event.title}</h2>
          </div>
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

        <div className="mt-4 flex flex-col justify-end">
          <div
            className={`font-black text-3xl md:text-4xl tracking-tight flex items-baseline gap-2 ${displayDays === 0 ? "text-secondary" : "text-primary"}`}
          >
            <span className="text-sm font-medium text-base-content/50">
              {prefixText}
            </span>
            {displayDays} <span className="text-lg font-bold">天</span>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <div className="flex justify-between items-end text-xs text-base-content/50 font-medium">
            <div className="flex flex-wrap gap-1.5">
              {event.categories.map((c) => (
                <span
                  key={c.id}
                  className="badge badge-outline border-base-300 text-[10px] px-2 py-1 h-auto"
                >
                  {c.name}
                </span>
              ))}
            </div>
            {/* 纪念日显示下一次的日期，任务显示原本日期 */}
            <span className="shrink-0 ml-2">
              {format(targetDisplayDate, "yyyy/MM/dd")}
            </span>
          </div>
          <progress
            className={`progress w-full h-1.5 ${displayDays === 0 ? "progress-secondary" : "progress-primary"}`}
            value={progressValue}
            max={maxDays}
          ></progress>
        </div>
      </div>
    </motion.div>
  );
}
