import { AnimatePresence, motion } from "framer-motion";
import { useEventStore } from "../store/eventStore";
import { useUiBus } from "../store/uiBus";
import EventCard from "./EventCard";
import { LayoutGrid, Layers } from "lucide-react";
import { sortEventsOptimally } from "../utils/dateUtils";

export default function EventList() {
  const { events } = useEventStore();
  const { viewMode, toggleViewMode } = useUiBus();

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

  // 🌟 统一动画引擎：500ms 阻尼弹簧曲线
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
            {sortedEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
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
            {Object.entries(groupedEvents).map(([categoryName, catEvents]) => (
              <div
                key={categoryName}
                /* 坐标1：外层容器同步 */
                className={`group collapse collapse-arrow w-full overflow-hidden
                  bg-primary/15 rounded-[2.5rem] border border-transparent
                  has-[:checked]:bg-base-100 has-[:checked]:border-base-200/60 has-[:checked]:shadow-sm
                  ${appleSmoothTransition}`}
              >
                <input type="checkbox" defaultChecked />

                {/* 坐标2：标题盒子同步（这一步修复了右侧箭头的旋转动画跳变） */}
                <div
                  className={`collapse-title relative min-h-[4.5rem] ${appleSmoothTransition}`}
                >
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-3 w-max
                    left-1/2 -translate-x-1/2 scale-105
                    group-has-[:checked]:left-6 group-has-[:checked]:translate-x-0 group-has-[:checked]:scale-100
                    ${appleSmoothTransition}`}
                  >
                    <span
                      className={`font-black tracking-widest text-primary
                      group-has-[:checked]:bg-primary/10 group-has-[:checked]:px-5 group-has-[:checked]:py-1.5 group-has-[:checked]:rounded-full
                      ${appleSmoothTransition}`}
                    >
                      {categoryName}
                    </span>

                    <span
                      className={`font-medium whitespace-nowrap
                      text-primary/60 text-sm
                      group-has-[:checked]:text-base-content/40 group-has-[:checked]:text-xs
                      ${appleSmoothTransition}`}
                    >
                      共 {catEvents.length} 个日子
                    </span>
                  </div>
                </div>

                {/* 坐标3：内容高度同步（这一步彻底修复了高度突然塌陷成胶囊的 Bug！） */}
                <div className={`collapse-content ${appleSmoothTransition}`}>
                  <div
                    className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-4 pb-2 border-t border-transparent
                    group-has-[:checked]:border-base-200/50
                    ${appleSmoothTransition}`}
                  >
                    {catEvents.map((event) => (
                      <EventCard
                        key={`${categoryName}-${event.id}`}
                        event={event}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
