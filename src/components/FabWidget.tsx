import { useEffect, useState, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { LogicalSize } from "@tauri-apps/api/dpi";
import {
  differenceInDays,
  startOfDay,
  parseISO,
  setYear,
  isBefore,
  isSameDay,
} from "date-fns";
import { GripHorizontal } from "lucide-react";
import { AppEvent } from "../types";

interface WidgetEvent extends AppEvent {
  daysLeft: number;
}

export default function FabWidget() {
  const [urgentEvents, setUrgentEvents] = useState<WidgetEvent[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);

  // 🌟 将数据拉取逻辑单独抽离成一个函数，方便多处复用
  const fetchUrgent = async () => {
    try {
      const allEvents: AppEvent[] = await invoke("get_all_events");
      const today = startOfDay(new Date());

      const processedEvents: WidgetEvent[] = allEvents.map((e) => {
        const targetDate = e.target_date ? parseISO(e.target_date) : new Date();
        let target = startOfDay(targetDate);
        let daysLeft = 0;

        if (e.event_type === "anniversary") {
          let nextAnniv = setYear(target, today.getFullYear());
          if (isBefore(nextAnniv, today) && !isSameDay(nextAnniv, today)) {
            nextAnniv = setYear(target, today.getFullYear() + 1);
          }
          daysLeft = differenceInDays(nextAnniv, today);
        } else {
          daysLeft = differenceInDays(target, today);
        }
        return { ...e, daysLeft };
      });

      const filtered = processedEvents
        .filter((e) => e.event_type === "anniversary" || e.daysLeft >= 0)
        // 🌟 核心修改：同天按优先度排序
        .sort((a, b) => {
          if (a.daysLeft !== b.daysLeft) {
            return a.daysLeft - b.daysLeft; // 优先按剩余天数升序（越近越靠前）
          }
          // 天数相同时，按 importance（重要度/优先度）降序排列
          return b.importance - a.importance;
        })
        .slice(0, 3);

      setUrgentEvents(filtered);
    } catch (e) {
      console.error("【Widget】加载数据失败", e);
    }
  };

  // 🌟 核心修改：多重数据刷新机制
  useEffect(() => {
    // 1. 组件挂载时拉取一次
    fetchUrgent();

    // 2. 兜底轮询：每 30 秒自动查一次本地数据库，防止挂在屏幕上跨天了没变
    const timer = setInterval(fetchUrgent, 30000);

    // 3. 鼠标移入时刷新：只要用户的鼠标移动到悬浮窗上，立刻静默更新！
    window.addEventListener("mouseenter", fetchUrgent);

    // 4. 窗口获得焦点时刷新：当系统唤醒这个隐藏窗口时触发
    window.addEventListener("focus", fetchUrgent);

    // 组件卸载时清理所有监听器
    return () => {
      clearInterval(timer);
      window.removeEventListener("mouseenter", fetchUrgent);
      window.removeEventListener("focus", fetchUrgent);
    };
  }, []);

  // 动态调整 Tauri 窗口大小，包裹内容
  useEffect(() => {
    if (cardRef.current) {
      const actualHeight = cardRef.current.offsetHeight;
      const windowHeight = actualHeight;

      getCurrentWindow()
        .setSize(new LogicalSize(200, windowHeight))
        .catch((err) => console.error("调整窗口大小失败:", err));
    }
  }, [urgentEvents]);

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    getCurrentWindow().hide();
  };

  const handleLeftClick = async () => {
    try {
      await invoke("wake_main_window");
    } catch (error) {
      console.error("【Widget】唤醒主程序时发生错误:", error);
    }
  };

  return (
    <div
      ref={cardRef}
      onContextMenu={handleRightClick}
      className="w-full flex flex-col bg-base-100/95 backdrop-blur-xl text-base-content overflow-hidden rounded-2xl shadow-2xl border border-base-200/50"
    >
      <div
        data-tauri-drag-region
        className="h-6 bg-base-200/60 flex items-center justify-center cursor-grab active:cursor-grabbing shrink-0 transition-colors"
      >
        <GripHorizontal
          data-tauri-drag-region
          className="w-4 h-4 text-base-content/30 pointer-events-none"
        />
      </div>

      <div
        onClick={handleLeftClick}
        className="flex-1 flex flex-col p-2 space-y-2 cursor-pointer hover:bg-base-200/20 transition-colors"
      >
        {urgentEvents.length === 0 ? (
          <div className="flex items-center justify-center text-xs font-bold text-base-content/40 py-4">
            近无急办日程
          </div>
        ) : (
          urgentEvents.map((ev) => (
            <div
              key={ev.id}
              className="bg-base-200/40 rounded-xl p-3 flex items-center justify-between"
            >
              <div className="flex flex-col overflow-hidden mr-2">
                <span className="text-[10px] font-black text-primary uppercase tracking-wider mb-1">
                  {ev.event_type === "anniversary" ? "Anniversary" : "Task"}
                </span>
                <span className="text-sm font-bold text-base-content truncate">
                  {ev.title}
                </span>
              </div>

              <div className="text-xl font-black shrink-0 text-base-content/80 flex items-baseline gap-0.5">
                {ev.daysLeft === 0 ? (
                  <span className="text-sm text-primary">就在今天</span>
                ) : (
                  <>
                    {ev.daysLeft}
                    <span className="text-xs font-normal opacity-50 tracking-widest ml-0.5">
                      天
                    </span>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
