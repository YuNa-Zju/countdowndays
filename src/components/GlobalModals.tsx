import { useEffect } from "react";
import { useUiBus } from "../store/uiBus";
import { useEventStore } from "../store/eventStore";
import { Edit2, Trash2 } from "lucide-react";
import AddEventModal from "./AddEventModal";
import CommandPalette from "./CommandPalette"; // 🌟 引入
import { AnimatePresence, motion } from "framer-motion";

export default function GlobalModals() {
  const {
    isDeleteModalOpen,
    eventToDelete,
    closeDeleteModal,
    contextMenu,
    closeContextMenu,
    openEditModal,
    openDeleteModal,
  } = useUiBus();
  const { deleteEventOptimistic } = useEventStore();

  const handleDelete = () => {
    if (eventToDelete) deleteEventOptimistic(eventToDelete);
    closeDeleteModal();
  };

  useEffect(() => {
    if (!contextMenu.isOpen) return;
    const handleClickOutside = () => closeContextMenu();
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [contextMenu.isOpen, closeContextMenu]);

  return (
    <>
      {/* 全局浮动菜单 */}
      <AnimatePresence>
        {contextMenu.isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed z-50 bg-base-100 border border-base-200 shadow-xl rounded-2xl py-2 w-32"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="flex items-center gap-2 w-full px-4 py-2 hover:bg-base-200 hover:text-primary transition-colors text-sm"
              onClick={() => {
                openEditModal(contextMenu.eventId!);
                closeContextMenu();
              }}
            >
              <Edit2 className="w-4 h-4" /> 编辑
            </button>
            <button
              className="flex items-center gap-2 w-full px-4 py-2 hover:bg-error/10 text-error transition-colors text-sm"
              onClick={() => {
                openDeleteModal(contextMenu.eventId!);
                closeContextMenu();
              }}
            >
              <Trash2 className="w-4 h-4" /> 删除
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <dialog className={`modal ${isDeleteModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box rounded-3xl">
          <h3 className="font-bold text-lg text-error">删除确认</h3>
          <p className="py-4">你确定要删除这个倒数日吗？此操作无法恢复。</p>
          <div className="modal-action">
            <button
              className="btn btn-ghost rounded-full"
              onClick={closeDeleteModal}
            >
              取消
            </button>
            <button
              className="btn btn-error rounded-full px-6"
              onClick={handleDelete}
            >
              删除
            </button>
          </div>
        </div>
        <div className="modal-backdrop" onClick={closeDeleteModal}>
          <button>close</button>
        </div>
      </dialog>
      <AddEventModal />
      <CommandPalette /> {/* 🌟 挂载全局 Cmdk */}
    </>
  );
}
