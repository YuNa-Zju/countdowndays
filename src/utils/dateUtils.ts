import {
  isBefore,
  differenceInDays,
  setYear,
  isSameDay,
  startOfDay,
} from "date-fns";
import { AppEvent } from "../types";

// 计算距离目标日期的真实天数
export function calculateRemainingDays(event: AppEvent): number {
  const today = startOfDay(new Date());
  const target = startOfDay(new Date(event.target_date));

  if (event.event_type === "anniversary") {
    let nextAnniv = setYear(target, today.getFullYear());
    // 如果今年的已经过去了（且不是今天），就拨到明年
    if (isBefore(nextAnniv, today) && !isSameDay(nextAnniv, today)) {
      nextAnniv = setYear(target, today.getFullYear() + 1);
    }
    return differenceInDays(nextAnniv, today);
  } else {
    // 任务：如果是过去，天数为负数
    return differenceInDays(target, today);
  }
}

// 智能排序：最近的排前面，已过期的任务垫底
export function sortEventsOptimally(events: AppEvent[]): AppEvent[] {
  return [...events].sort((a, b) => {
    const daysA = calculateRemainingDays(a);
    const daysB = calculateRemainingDays(b);

    const isPastA = a.event_type === "task" && daysA < 0;
    const isPastB = b.event_type === "task" && daysB < 0;

    // 已过期的任务沉底
    if (isPastA && !isPastB) return 1;
    if (!isPastA && isPastB) return -1;

    // 如果都过期了，离现在越近的排越上面（也就是负数越小的排前面）
    if (isPastA && isPastB) return daysB - daysA;

    // 正常的按天数从小到大排
    return daysA - daysB;
  });
}
