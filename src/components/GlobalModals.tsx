import { useUiBus } from "../store/uiBus";
import { useEventStore } from "../store/eventStore";

export default function GlobalModals() {
  const {
    isDeleteModalOpen,
    eventToDelete,
    closeDeleteModal,
    isCreateModalOpen,
    closeModal,
  } = useUiBus();
  const { deleteEventOptimistic, addEventOptimistic } = useEventStore();

  const handleDelete = () => {
    if (eventToDelete) deleteEventOptimistic(eventToDelete);
    closeDeleteModal();
  };

  const handleMockCreate = () => {
    addEventOptimistic({
      title: "测试新日程",
      description: "这是一个无刷新乐观加载出来的日程。",
      target_date: new Date(Date.now() + 86400000 * 370).toISOString(),
      importance: 2,
      category: "生活",
      meta: "{}",
    });
    closeModal();
  };

  return (
    <>
      {/* 1. 删除确认弹窗 */}
      <dialog className={`modal ${isDeleteModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg text-error">删除确认</h3>
          <p className="py-4">你确定要删除这个倒数日吗？此操作无法恢复。</p>
          <div className="modal-action">
            <button className="btn" onClick={closeDeleteModal}>
              取消
            </button>
            <button className="btn btn-error" onClick={handleDelete}>
              删除
            </button>
          </div>
        </div>
        <form
          method="dialog"
          className="modal-backdrop"
          onClick={closeDeleteModal}
        >
          <button>close</button>
        </form>
      </dialog>

      {/* 2. 新建/编辑弹窗 (临时用按钮代替表单测试) */}
      <dialog className={`modal ${isCreateModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">管理日程</h3>
          <p className="text-sm text-base-content/60 mb-6">
            点击下方按钮测试乐观加载和 Toast 提示：
          </p>
          <div className="flex gap-2">
            <button
              className="btn btn-primary flex-1"
              onClick={handleMockCreate}
            >
              模拟生成一个日程
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop" onClick={closeModal}>
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}
