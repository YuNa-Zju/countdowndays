import { useEffect } from "react";
import { useUiBus } from "../store/uiBus";
import { useEventStore } from "../store/eventStore";
import { Edit2, X, Trash2 } from "lucide-react";
import AddEventModal from "./AddEventModal";
import CommandPalette from "./CommandPalette"; // 🌟 引入
import { AnimatePresence, motion } from "framer-motion";
import renderDescription from "../utils/textUtils";
import UpdateModal from "./UpdateModal";

export default function GlobalModals() {
  const {
    isDeleteModalOpen,
    eventToDelete,
    closeDeleteModal,
    contextMenu,
    closeContextMenu,
    openEditModal,
    openDeleteModal,
    isNoteModalOpen,
    noteModalContent,
    closeNoteModal,
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
      <UpdateModal />
      {isNoteModalOpen && noteModalContent && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-base-300/40 backdrop-blur-sm"
            onClick={closeNoteModal}
          ></div>
          <div className="bg-base-100 rounded-3xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col relative z-10 border border-base-200">
            <div className="p-6 pb-4 flex justify-between items-center border-b border-base-200/50">
              <h3 className="text-xl font-bold text-base-content line-clamp-1 pr-4">
                {noteModalContent.title}
              </h3>
              <button
                onClick={closeNoteModal}
                className="btn btn-sm btn-circle btn-ghost"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto text-lg leading-relaxed text-base-content/80 whitespace-pre-wrap">
              {renderDescription(noteModalContent.description)}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
