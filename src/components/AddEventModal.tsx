import { useState, useEffect } from "react";
import { useUiBus } from "../store/uiBus";
import { useEventStore } from "../store/eventStore";
import CustomSlider from "./CustomSlider";
import { format } from "date-fns";

export default function AddEventModal() {
  const { isCreateModalOpen, editingEventId, closeModal } = useUiBus();
  const { events, addEventOptimistic, updateEventOptimistic } = useEventStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [importance, setImportance] = useState(50);
  const [category, setCategory] = useState("默认");

  // 当弹窗打开且有编辑 ID 时，回显数据
  useEffect(() => {
    if (isCreateModalOpen && editingEventId) {
      const ev = events.find((e) => e.id === editingEventId);
      if (ev) {
        setTitle(ev.title);
        setDescription(ev.description);
        // HTML date input 需要 YYYY-MM-DD 格式
        setTargetDate(format(new Date(ev.target_date), "yyyy-MM-dd"));
        setImportance(ev.importance);
        setCategory(ev.category);
      }
    } else if (isCreateModalOpen && !editingEventId) {
      // 新建模式，清空表单
      setTitle("");
      setDescription("");
      setTargetDate(format(new Date(), "yyyy-MM-dd"));
      setImportance(50);
      setCategory("默认");
    }
  }, [isCreateModalOpen, editingEventId, events]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetDate) return;

    // 拼装 ISO 字符串
    const isoDate = new Date(targetDate).toISOString();

    if (editingEventId) {
      updateEventOptimistic({
        id: editingEventId,
        title,
        description,
        target_date: isoDate,
        importance,
        category,
      });
    } else {
      addEventOptimistic({
        title,
        description,
        target_date: isoDate,
        importance,
        category,
        meta: "{}",
      });
    }
    closeModal();
  };

  return (
    <dialog className={`modal ${isCreateModalOpen ? "modal-open" : ""}`}>
      <div className="modal-box w-11/12 max-w-lg rounded-3xl">
        <h3 className="font-bold text-xl mb-6 text-base-content">
          {editingEventId ? "编辑倒数日" : "新建倒数日"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">日程名称</span>
            </label>
            <input
              required
              type="text"
              placeholder="例如：考研 / 跨年"
              className="input input-bordered rounded-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">目标日期</span>
              </label>
              <input
                required
                type="date"
                className="input input-bordered rounded-full"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">分组标签</span>
              </label>
              <input
                required
                type="text"
                placeholder="例如：学习"
                className="input input-bordered rounded-full"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">详细描述</span>
            </label>
            <textarea
              placeholder="写点什么备注一下..."
              className="textarea textarea-bordered rounded-3xl"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-control mt-2">
            <label className="label">
              <span className="label-text font-medium">重要程度</span>
            </label>
            <CustomSlider value={importance} onChange={setImportance} />
          </div>

          <div className="modal-action mt-8">
            <button
              type="button"
              className="btn btn-ghost rounded-full"
              onClick={closeModal}
            >
              取消
            </button>
            <button type="submit" className="btn btn-primary rounded-full px-8">
              保存日程
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={closeModal}>
        <button>close</button>
      </div>
    </dialog>
  );
}
