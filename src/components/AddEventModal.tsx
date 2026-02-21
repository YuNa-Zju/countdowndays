import { useState, useRef } from "react";
import { Plus } from "lucide-react";
import { useUiBus } from "../store/uiBus";
import { useEventStore } from "../store/eventStore";
import CustomSlider from "./CustomSlider";
import { format } from "date-fns";
import { Category } from "../types";

interface EventFormData {
  title: string;
  description: string;
  target_date: string;
  importance: number;
  category_ids: number[];
  event_type: "task" | "anniversary";
}

const styles = {
  input:
    "appearance-none w-full min-w-0 box-border block bg-base-200/50 border border-base-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:bg-base-100 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-base-content/30",
  label:
    "block text-xs font-semibold text-base-content/50 uppercase tracking-widest mb-2 ml-1",
  card: "bg-base-100 p-5 rounded-3xl border border-base-200 shadow-sm flex flex-col w-full min-w-0 overflow-hidden",
};

const BasicInfoSection = ({
  formData,
  updateField,
}: {
  formData: EventFormData;
  updateField: any;
}) => (
  <div className={styles.card}>
    <div className="flex justify-between items-center mb-5 gap-2">
      <h4 className="text-sm font-bold text-base-content shrink-0">基础设定</h4>
      <div className="flex bg-base-200 p-1 rounded-xl shadow-inner shrink-0">
        <button
          type="button"
          className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${formData.event_type === "task" ? "bg-base-100 shadow-sm text-base-content" : "text-base-content/50 hover:text-base-content"}`}
          onClick={() => updateField("event_type", "task")}
        >
          任务
        </button>
        <button
          type="button"
          className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${formData.event_type === "anniversary" ? "bg-base-100 shadow-sm text-secondary" : "text-base-content/50 hover:text-base-content"}`}
          onClick={() => updateField("event_type", "anniversary")}
        >
          纪念日
        </button>
      </div>
    </div>
    <div className="space-y-4 w-full min-w-0">
      <div className="flex flex-col w-full min-w-0">
        <label className={styles.label}>日程名称</label>
        <input
          required
          type="text"
          placeholder="例如：考研 / 跨年"
          className={styles.input}
          value={formData.title}
          onChange={(e) => updateField("title", e.target.value)}
        />
      </div>
      <div className="flex flex-col w-full min-w-0">
        <label className={styles.label}>目标日期</label>
        <input
          required
          type="date"
          className={styles.input}
          value={formData.target_date}
          onChange={(e) => updateField("target_date", e.target.value)}
        />
      </div>
    </div>
  </div>
);

const MetaSection = ({
  formData,
  categories,
  updateField,
  onAddCategory,
}: any) => {
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const newTagInputRef = useRef<HTMLInputElement>(null);

  // 🌟 修复：加上 async/await 等待后端返回真实的 tag ID
  const handleAddNewTag = async () => {
    if (newTagName.trim()) {
      try {
        const newId = await onAddCategory(newTagName.trim());
        updateField("category_ids", [...formData.category_ids, newId]);
      } catch (e) {
        // 如果创建失败，直接静默即可，Store 会负责 Toast 报错
      }
    }
    setIsAddingTag(false);
    setNewTagName("");
  };

  const toggleCategory = (id: number) => {
    const current = formData.category_ids;
    updateField(
      "category_ids",
      current.includes(id)
        ? current.filter((cid: number) => cid !== id)
        : [...current, id],
    );
  };

  return (
    <div className={`${styles.card} h-full`}>
      <h4 className="text-sm font-bold text-base-content mb-4 shrink-0">
        详情与归档
      </h4>
      <div className="flex flex-col w-full min-w-0 mb-5">
        <label className={styles.label}>分组标签 (多选)</label>
        <div
          className={`w-full min-w-0 bg-base-200/30 border rounded-2xl p-3 flex flex-wrap gap-2 items-center transition-all ${isAddingTag ? "border-primary bg-base-100 ring-2 ring-primary/10" : "border-base-300"}`}
        >
          {categories.map((cat: Category) => {
            const isSelected = formData.category_ids.includes(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${isSelected ? "bg-primary text-primary-content border-primary shadow-sm scale-105" : "bg-base-100 text-base-content/60 border-base-300 hover:border-base-400"}`}
              >
                {cat.name}
              </button>
            );
          })}
          {isAddingTag ? (
            <input
              ref={newTagInputRef}
              type="text"
              autoFocus
              placeholder="回车确认"
              className="bg-transparent border-none focus:outline-none text-xs font-bold w-20 h-7 px-1 text-base-content placeholder:text-base-content/30 min-w-0"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onBlur={handleAddNewTag}
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), handleAddNewTag())
              }
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingTag(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold border border-dashed border-base-300 text-base-content/50 hover:text-base-content hover:border-base-400 flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3 h-3" /> 新建
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-col flex-1 w-full min-w-0">
        <label className={styles.label}>详细描述</label>
        <textarea
          placeholder="写点什么备注一下..."
          className={`${styles.input} flex-1 min-h-[5rem] resize-none`}
          value={formData.description}
          onChange={(e) => updateField("description", e.target.value)}
        />
      </div>
    </div>
  );
};

function EventForm({
  initialData,
  categories,
  isEditing,
  onSubmit,
  onCancel,
  onAddCategory,
}: any) {
  const [formData, setFormData] = useState<EventFormData>(initialData);

  const updateField = <K extends keyof EventFormData>(
    field: K,
    value: EventFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.target_date) return;
    onSubmit(formData);
  };

  return (
    <form
      id="event-form"
      onSubmit={handleSubmit}
      className="flex flex-col h-full overflow-hidden w-full min-w-0"
    >
      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-base-200/40 w-full min-w-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full min-w-0">
          <div className="space-y-5 w-full min-w-0 flex flex-col">
            <BasicInfoSection formData={formData} updateField={updateField} />
            <div className={styles.card}>
              <h4 className="text-sm font-bold text-base-content mb-4 shrink-0">
                优先级
              </h4>
              <label className={styles.label}>重要程度评估</label>
              <div className="bg-base-200/30 border border-base-300 rounded-2xl p-4 shadow-inner w-full min-w-0">
                <CustomSlider
                  value={formData.importance}
                  onChange={(val) => updateField("importance", val)}
                />
              </div>
            </div>
          </div>
          <div className="w-full min-w-0 flex flex-col">
            <MetaSection
              formData={formData}
              categories={categories}
              updateField={updateField}
              onAddCategory={onAddCategory}
            />
          </div>
        </div>
      </div>

      <div className="p-4 px-6 border-t border-base-200 bg-base-100 shrink-0 flex justify-end gap-3 rounded-b-[2rem]">
        <button
          type="button"
          className="btn btn-ghost rounded-xl font-bold"
          onClick={onCancel}
        >
          取消
        </button>
        <button
          type="submit"
          className="btn btn-primary rounded-xl px-8 font-bold shadow-sm"
        >
          {isEditing ? "保存修改" : "创建日程"}
        </button>
      </div>
    </form>
  );
}

export default function AddEventModal() {
  const { isCreateModalOpen, editingEventId, closeModal } = useUiBus();
  const {
    events,
    categories,
    addEventOptimistic,
    updateEventOptimistic,
    addCategoryOptimistic,
  } = useEventStore();

  const generateInitialData = (): EventFormData => {
    if (editingEventId) {
      const ev = events.find((e) => e.id === editingEventId);
      if (ev) {
        return {
          title: ev.title,
          description: ev.description,
          target_date: format(new Date(ev.target_date), "yyyy-MM-dd"),
          importance: ev.importance,
          category_ids: ev.categories.map((c) => c.id),
          event_type: ev.event_type,
        };
      }
    }
    return {
      title: "",
      description: "",
      target_date: format(new Date(), "yyyy-MM-dd"),
      importance: 50,
      category_ids: [],
      event_type: "task",
    };
  };

  // 🌟 修复：加上 async/await，让表单等待真实后端响应后再关闭弹窗
  const handleFormSubmit = async (data: EventFormData) => {
    const isoDate = new Date(data.target_date).toISOString();
    try {
      if (editingEventId) {
        await updateEventOptimistic({
          id: editingEventId,
          ...data,
          target_date: isoDate,
        });
      } else {
        await addEventOptimistic({ ...data, target_date: isoDate, meta: "{}" });
      }
      closeModal();
    } catch (e) {
      // 报错已经在 Store 层 Toast 处理过了，这里只需要拦截不关闭 Modal 即可
    }
  };

  return (
    <dialog className={`modal ${isCreateModalOpen ? "modal-open" : ""}`}>
      <div className="modal-box w-11/12 max-w-4xl p-0 rounded-[2rem] bg-base-100 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden min-w-0">
        <div className="px-6 py-5 border-b border-base-200 shrink-0 bg-base-100">
          <h3 className="font-extrabold text-xl text-base-content tracking-tight">
            {editingEventId ? "编辑倒数日" : "新建倒数日"}
          </h3>
        </div>
        {isCreateModalOpen && (
          <EventForm
            initialData={generateInitialData()}
            categories={categories}
            isEditing={!!editingEventId}
            onSubmit={handleFormSubmit}
            onCancel={closeModal}
            onAddCategory={addCategoryOptimistic}
          />
        )}
      </div>
      <div
        className="modal-backdrop bg-neutral/30 backdrop-blur-sm"
        onClick={closeModal}
      >
        <button>close</button>
      </div>
    </dialog>
  );
}
