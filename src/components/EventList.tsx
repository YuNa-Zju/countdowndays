import { AnimatePresence, motion } from "framer-motion";
import { useEventStore } from "../store/eventStore";
import { useUiBus } from "../store/uiBus";
import EventCard from "./EventCard";
import { LayoutGrid, Layers } from "lucide-react";
import { sortEventsOptimally } from "../utils/dateUtils";

export default function EventList() {
  const { events } = useEventStore();
  const { viewMode, toggleViewMode, expandedGroups, toggleGroup } = useUiBus();

  const sortedEvents = sortEventsOptimally(events);

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-base-content tracking-tight">
          我的倒数日
        </h1>
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

      {/* 视图切换动画 */}
      <AnimatePresence mode="wait">
        {viewMode === "flat" ? (
          <motion.div
            key="flat"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {/* 🌟 核心修复 1：平铺视图的删除动画 */}
            <AnimatePresence mode="popLayout">
              {sortedEvents.map((event) => (
                <motion.div
                  key={event.id}
                  layout // 让卡片具有移位动画能力
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }} // 消失时缩小并稍微模糊
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <EventCard event={event} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="grouped"
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
                  has-[:checked]:bg-base-100 has-[:checked]:border-base-200/60 has-[:checked]:shadow-sm
                  ${appleSmoothTransition}`}
                >
                  <input
                    type="checkbox"
                    checked={isExpanded}
                    onChange={() => toggleGroup(categoryName)}
                  />

                  <div
                    className={`collapse-title relative min-h-[4.5rem] ${appleSmoothTransition}`}
                  >
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-3 w-max left-1/2 -translate-x-1/2 scale-105 group-has-[:checked]:left-6 group-has-[:checked]:translate-x-0 group-has-[:checked]:scale-100 ${appleSmoothTransition}`}
                    >
                      <span
                        className={`font-black tracking-widest text-primary group-has-[:checked]:bg-primary/10 group-has-[:checked]:px-5 group-has-[:checked]:py-1.5 group-has-[:checked]:rounded-full ${appleSmoothTransition}`}
                      >
                        {categoryName}
                      </span>
                      <span
                        className={`font-medium whitespace-nowrap text-primary/60 text-sm group-has-[:checked]:text-base-content/40 group-has-[:checked]:text-xs ${appleSmoothTransition}`}
                      >
                        共 {catEvents.length} 个日子
                      </span>
                    </div>
                  </div>

                  <div className={`collapse-content ${appleSmoothTransition}`}>
                    <div
                      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-4 pb-2 border-t border-transparent group-has-[:checked]:border-base-200/50 ${appleSmoothTransition}`}
                    >
                      {/* 🌟 核心修复 2：分组视图内部的删除动画 */}
                      <AnimatePresence mode="popLayout">
                        {catEvents.map((event) => (
                          <motion.div
                            key={`${categoryName}-${event.id}`}
                            layout // 让卡片具有移位动画能力
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
        )}
      </AnimatePresence>
    </div>
  );
}
