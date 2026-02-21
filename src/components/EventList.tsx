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

  // 🌟 修复: 因为现在是多对多（categories数组），我们取第一个标签名作为主分组名，没有则叫"未分类"
  const groupedEvents = sortedEvents.reduce(
    (acc, event) => {
      const mainCategoryName =
        event.categories && event.categories.length > 0
          ? event.categories[0].name
          : "未分类";
      if (!acc[mainCategoryName]) acc[mainCategoryName] = [];
      acc[mainCategoryName].push(event);
      return acc;
    },
    {} as Record<string, typeof events>,
  );

  return (
    <div className="pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-base-content tracking-tight">
          我的倒数日
        </h1>
        <button
          onClick={toggleViewMode}
          className="btn btn-sm btn-active btn-ghost rounded-full shadow-sm px-4"
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
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            <AnimatePresence>
              {sortedEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="grouped"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="space-y-5"
          >
            {Object.entries(groupedEvents).map(([categoryName, catEvents]) => (
              <div
                key={categoryName}
                className="collapse collapse-arrow bg-base-100 border border-base-200 shadow-sm rounded-3xl"
              >
                <input type="checkbox" defaultChecked />
                <div className="collapse-title text-xl font-medium flex items-center gap-3">
                  <span className="badge badge-primary badge-lg border-none">
                    {categoryName}
                  </span>
                  <span className="text-sm text-base-content/40 font-normal">
                    ({catEvents.length} 项)
                  </span>
                </div>
                <div className="collapse-content">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1 pb-2">
                    {catEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
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
