import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useEventStore } from "../store/eventStore";
import { useUiBus } from "../store/uiBus";
import EventCard from "./EventCard";
import { LayoutGrid, Layers, Archive, CalendarDays, Inbox } from "lucide-react";
import { sortEventsOptimally } from "../utils/dateUtils";
import { isBefore, isSameDay, startOfDay } from "date-fns";

export default function EventList() {
  const { events } = useEventStore();
  const { viewMode, toggleViewMode, expandedGroups, toggleGroup } = useUiBus();

  // 🌟 新增：当前激活的 Tab 状态
  const [activeTab, setActiveTab] = useState<"active" | "archive">("active");

  // 🌟 新增：智能分离活跃事件与归档（过期）事件
  const { activeEvents, archivedEvents } = useMemo(() => {
    const today = startOfDay(new Date());
    const active: typeof events = [];
    const archived: typeof events = [];

    events.forEach((event) => {
      const target = startOfDay(new Date(event.target_date));
      // 判断是否为过期的任务（纪念日永远不会过期）
      const isPastTask =
        event.event_type === "task" &&
        isBefore(target, today) &&
        !isSameDay(target, today);

      if (isPastTask) {
        archived.push(event);
      } else {
        active.push(event);
      }
    });

    return { activeEvents: active, archivedEvents: archived };
  }, [events]);

  // 根据当前 Tab 决定要渲染的事件源
  const currentEvents = activeTab === "active" ? activeEvents : archivedEvents;
  const sortedEvents = sortEventsOptimally(currentEvents);

  // 分组逻辑只针对当前显示的事件
  const groupedEvents = sortedEvents.reduce(
    (acc, event) => {
      if (!event.categories || event.categories.length === 0) {
        if (!acc["未分类"]) acc["未分类"] = [];
        acc["未分类"].push(event);
      } else {
        event.categories.forEach((cat) => {
          if (!acc[cat.name]) acc[cat.name] = [];
          acc[cat.name].push(event);
        });
      }
      return acc;
    },
    {} as Record<string, typeof events>,
  );

  const appleSmoothTransition =
    "!transition-all !duration-[500ms] !ease-[cubic-bezier(0.16,1,0.3,1)]";

  return (
    <div className="pb-24">
      {/* 🌟 顶部导航区：包含了 Tab 切换和视图切换 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        {/* DaisyUI Boxed Tabs */}
        <div
          role="tablist"
          className="tabs tabs-boxed bg-base-200/50 p-1 font-bold"
        >
          <button
            role="tab"
            className={`tab h-10 px-5 rounded-xl transition-all ${
              activeTab === "active"
                ? "tab-active bg-base-100 shadow-sm text-primary"
                : "text-base-content/50 hover:text-base-content/80"
            }`}
            onClick={() => setActiveTab("active")}
          >
            <CalendarDays className="w-4 h-4 mr-2" />
            进行中
            <span className="ml-2 bg-base-content/10 px-2 py-0.5 rounded-full text-[10px]">
              {activeEvents.length}
            </span>
          </button>

          <button
            role="tab"
            className={`tab h-10 px-5 rounded-xl transition-all ${
              activeTab === "archive"
                ? "tab-active bg-base-100 shadow-sm text-primary"
                : "text-base-content/50 hover:text-base-content/80"
            }`}
            onClick={() => setActiveTab("archive")}
          >
            <Archive className="w-4 h-4 mr-2" />
            归档箱
            {archivedEvents.length > 0 && (
              <span className="ml-2 bg-base-content/10 px-2 py-0.5 rounded-full text-[10px]">
                {archivedEvents.length}
              </span>
            )}
          </button>
        </div>

        <button
          onClick={toggleViewMode}
          className="btn btn-sm btn-ghost rounded-full shadow-sm px-4"
        >
          {viewMode === "flat" ? (
            <>
              <Layers className="w-4 h-4 mr-1" /> 分组视图
            </>
          ) : (
            <>
              <LayoutGrid className="w-4 h-4 mr-1" /> 平铺视图
            </>
          )}
        </button>
      </div>

      {/* 🌟 空状态展示（比如归档箱没有内容时） */}
      {sortedEvents.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 opacity-30 select-none"
        >
          <Inbox className="w-20 h-20 mb-4 stroke-1" />
          <p className="text-lg font-bold tracking-widest">
            {activeTab === "active" ? "暂无进行中的日子" : "归档箱空空如也"}
          </p>
        </motion.div>
      )}

      {/* 视图切换动画 */}
      <AnimatePresence mode="wait">
        {sortedEvents.length > 0 && viewMode === "flat" ? (
          <motion.div
            key={`flat-${activeTab}`} // 加上 activeTab 确保切换 Tab 时触发动画
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            <AnimatePresence mode="popLayout">
              {sortedEvents.map((event) => (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <EventCard event={event} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : sortedEvents.length > 0 ? (
          <motion.div
            key={`grouped-${activeTab}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {Object.entries(groupedEvents).map(([categoryName, catEvents]) => {
              const isExpanded = expandedGroups[categoryName] !== false;

              return (
                <div
                  key={categoryName}
                  className={`group collapse collapse-arrow w-full overflow-hidden
                  bg-primary/15 rounded-[2.5rem] border border-transparent
                  has-checked:bg-base-100 has-checked:border-base-200/60 has-checked:shadow-sm
                  ${appleSmoothTransition}`}
                >
                  <input
                    type="checkbox"
                    checked={isExpanded}
                    onChange={() => toggleGroup(categoryName)}
                  />

                  <div
                    className={`collapse-title relative min-h-18 ${appleSmoothTransition}`}
                  >
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-3 w-max left-1/2 -translate-x-1/2 scale-105 group-has-checked:left-6 group-has-checked:translate-x-0 group-has-checked:scale-100 ${appleSmoothTransition}`}
                    >
                      <span
                        className={`font-black tracking-widest text-primary group-has-checked:bg-primary/10 group-has-checked:px-5 group-has-checked:py-1.5 group-has-checked:rounded-full ${appleSmoothTransition}`}
                      >
                        {categoryName}
                      </span>
                      <span
                        className={`font-medium whitespace-nowrap text-primary/60 text-sm group-has-checked:text-base-content/40 group-has-checked:text-xs ${appleSmoothTransition}`}
                      >
                        共 {catEvents.length} 个日子
                      </span>
                    </div>
                  </div>

                  <div className={`collapse-content ${appleSmoothTransition}`}>
                    <div
                      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-4 pb-2 border-t border-transparent group-has-checked:border-base-200/50 ${appleSmoothTransition}`}
                    >
                      <AnimatePresence mode="popLayout">
                        {catEvents.map((event) => (
                          <motion.div
                            key={`${categoryName}-${event.id}`}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{
                              opacity: 0,
                              scale: 0.8,
                              filter: "blur(4px)",
                            }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                          >
                            <EventCard event={event} />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
