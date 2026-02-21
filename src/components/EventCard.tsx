import { motion } from "framer-motion";
import { MoreVertical, Edit2, Trash2 } from "lucide-react";
import { useUiBus } from "../store/uiBus";
import { AppEvent } from "../types";

interface EventCardProps {
  event: AppEvent;
}

export default function EventCard({ event }: EventCardProps) {
  const { openEditModal, openDeleteModal } = useUiBus();

  const targetTime = new Date(event.target_date).getTime();
  const now = new Date().getTime();
  const diffDays = Math.ceil((targetTime - now) / (1000 * 60 * 60 * 24));
  const isPast = diffDays < 0;

  const maxDays = 365;
  const progressValue = isPast ? maxDays : Math.max(0, maxDays - diffDays);

  const importanceBadge =
    event.importance >= 3 ? (
      <div className="badge badge-error badge-sm">紧急</div>
    ) : event.importance >= 2 ? (
      <div className="badge badge-warning badge-sm">重要</div>
    ) : (
      <div className="badge badge-info badge-sm">普通</div>
    );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
      className="card bg-base-100 shadow-sm hover:shadow-xl border border-base-200 transition-shadow overflow-visible"
    >
      <div className="card-body p-5">
        <div className="flex justify-between items-start mb-2">
          <h2 className="card-title text-lg truncate pr-2">{event.title}</h2>

          <div className="dropdown dropdown-left dropdown-end z-10">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-sm btn-circle btn-ghost"
            >
              <MoreVertical className="w-4 h-4 text-base-content/50" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu p-2 shadow-xl bg-base-100 rounded-box w-32 border border-base-200 gap-1"
            >
              <li>
                <button
                  onClick={() => openEditModal(event.id)}
                  className="hover:text-primary"
                >
                  <Edit2 className="w-4 h-4" /> 编辑
                </button>
              </li>
              <li>
                <button
                  onClick={() => openDeleteModal(event.id)}
                  className="text-error hover:bg-error/10 hover:text-error"
                >
                  <Trash2 className="w-4 h-4" /> 删除
                </button>
              </li>
            </ul>
          </div>
        </div>

        <p className="text-sm text-base-content/60 line-clamp-2 min-h-[2.5rem]">
          {event.description}
        </p>

        <div className="mt-4 flex items-end justify-between">
          <div className="text-primary font-black text-4xl">
            {Math.abs(diffDays)}
            <span className="text-sm font-normal text-base-content/50 ml-1">
              {isPast ? "天前" : "天"}
            </span>
          </div>
        </div>

        <div className="mt-4 space-y-1">
          <div className="flex justify-between text-xs text-base-content/50">
            <span>{event.category}</span>
            <span>{new Date(event.target_date).toLocaleDateString()}</span>
          </div>
          <progress
            className={`progress w-full ${isPast ? "progress-error" : "progress-primary"}`}
            value={progressValue}
            max={maxDays}
          ></progress>
        </div>
      </div>
    </motion.div>
  );
}
