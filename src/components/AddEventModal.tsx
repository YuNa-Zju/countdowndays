import { useState, useRef, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { useUiBus } from "../store/uiBus";
import { useEventStore } from "../store/eventStore";
import CustomSlider from "./CustomSlider";
import { format } from "date-fns";
import { Category } from "../types";

// ============================================================================
// 1. 样式系统：回归简约与秩序
// ============================================================================
const styles = {
  input:
    "appearance-none w-full box-border block bg-base-200/50 border border-base-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:bg-base-100 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-base-content/30",
  label:
    "block text-[10px] font-bold text-base-content/40 uppercase tracking-widest mb-2 ml-1",
  card: "bg-base-100 p-5 rounded-2xl border border-base-200 shadow-sm flex flex-col w-full min-w-0 overflow-hidden",
};

// ============================================================================
// 2. 基础设定区块
// ============================================================================
const BasicInfoSection = ({
  formData,
  updateField,
}: {
  formData: any;
  updateField: any;
}) => (
  <div className={styles.card}>
    <div className="flex justify-between items-center mb-4 gap-2">
      <h4 className="text-xs font-bold text-base-content uppercase tracking-tighter">
        基础信息
      </h4>
      <div className="flex bg-base-200 p-1 rounded-lg shrink-0">
        <button
          type="button"
          className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${formData.event_type === "task" ? "bg-base-100 shadow-sm text-warning" : "text-base-content/40"}`}
          onClick={() => updateField("event_type", "task")}
        >
          任务
        </button>
        <button
          type="button"
          className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${formData.event_type === "anniversary" ? "bg-base-100 shadow-sm text-info" : "text-base-content/40"}`}
          onClick={() => updateField("event_type", "anniversary")}
        >
          纪念日
        </button>
      </div>
    </div>

    <div className="space-y-4">
      <div className="flex flex-col">
        <label className={styles.label}>名称</label>
        <input
          required
          type="text"
          placeholder="起个名字..."
          className={styles.input}
          value={formData.title}
          onChange={(e) => updateField("title", e.target.value)}
        />
      </div>
      <div className="flex flex-col">
        <label className={styles.label}>日期</label>
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

// ============================================================================
// 3. 标签与描述区块
// ============================================================================
const MetaSection = ({
  formData,
  categories,
  updateField,
  onAddCategory,
}: any) => {
  const { deleteCategoryOptimistic } = useEventStore();
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const newTagInputRef = useRef<HTMLInputElement>(null);

  const handleAddNewTag = async () => {
    if (newTagName.trim()) {
      const newId = await onAddCategory(newTagName.trim());
      updateField("category_ids", [...formData.category_ids, newId]);
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
      <h4 className="text-xs font-bold text-base-content mb-4 uppercase tracking-tighter">
        分类备注
      </h4>

      <div className="mb-4">
        <label className={styles.label}>标签</label>
        <div className="bg-base-200/30 border border-base-200 rounded-xl p-3 flex flex-wrap gap-2 items-center">
          {categories.map((cat: Category) => {
            const isSelected = formData.category_ids.includes(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all
                  ${isSelected ? "bg-primary text-primary-content" : "bg-base-100 text-base-content/40 hover:bg-base-200"}`}
              >
                {cat.name}
                <X
                  className="w-3 h-3 opacity-40 hover:text-error transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("删除标签？")) deleteCategoryOptimistic(cat.id);
                  }}
                />
              </button>
            );
          })}

          {isAddingTag ? (
            <input
              ref={newTagInputRef}
              type="text"
              autoFocus
              className="bg-transparent border-none text-[10px] font-bold w-16 px-1 outline-none"
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
              className="p-1.5 rounded-full border border-dashed border-base-300 text-base-content/30 hover:text-primary transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <label className={styles.label}>详情备注</label>
        <textarea
          placeholder="记点什么..."
          className={`${styles.input} flex-1 min-h-[100px] resize-none`}
          value={formData.description}
          onChange={(e) => updateField("description", e.target.value)}
        />
      </div>
    </div>
  );
};

// ============================================================================
// 4. 主表单组装
// ============================================================================
function EventForm({
  initialData,
  categories,
  isEditing,
  onSubmit,
  onCancel,
  onAddCategory,
}: any) {
  const [formData, setFormData] = useState(initialData);
  const updateField = (field: string, value: any) =>
    setFormData((prev: any) => ({ ...prev, [field]: value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(formData);
      }}
      className="flex flex-col h-full overflow-hidden"
    >
      <div className="flex-1 overflow-y-auto p-5 md:p-6 bg-base-200/30">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
          <div className="space-y-5">
            <BasicInfoSection formData={formData} updateField={updateField} />
            <div className={styles.card}>
              <h4 className="text-xs font-bold text-base-content mb-3 uppercase tracking-tighter">
                优先级
              </h4>
              <div className="bg-base-200/30 border border-base-300 rounded-xl p-4 shadow-inner">
                <CustomSlider
                  value={formData.importance}
                  onChange={(val) => updateField("importance", val)}
                />
              </div>
            </div>
          </div>

          <MetaSection
            formData={formData}
            categories={categories}
            updateField={updateField}
            onAddCategory={onAddCategory}
          />
        </div>
      </div>

      <div className="p-4 px-6 border-t border-base-200 bg-base-100 flex justify-end items-center gap-4">
        <button
          type="button"
          className="text-xs font-bold text-base-content/30 hover:text-base-content uppercase"
          onClick={onCancel}
        >
          取消
        </button>
        <button
          type="submit"
          className="btn btn-primary btn-md rounded-xl px-8 font-bold text-xs uppercase tracking-widest shadow-md shadow-primary/10"
        >
          {isEditing ? "更新日程" : "保存日程"}
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

  const generateInitialData = () => {
    if (editingEventId) {
      const ev = events.find((e) => e.id === editingEventId);
      if (ev)
        return {
          ...ev,
          target_date: format(new Date(ev.target_date), "yyyy-MM-dd"),
          category_ids: ev.categories.map((c) => c.id),
        };
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

  return (
    <dialog className={`modal ${isCreateModalOpen ? "modal-open" : ""}`}>
      <div className="modal-box w-11/12 max-w-4xl p-0 rounded-2xl bg-base-100 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-base-200 flex justify-between items-center">
          <h3 className="font-bold text-sm uppercase tracking-widest text-base-content/60">
            {editingEventId ? "Edit Event" : "New Event"}
          </h3>
          <button
            onClick={closeModal}
            className="btn btn-ghost btn-xs btn-circle opacity-30 hover:opacity-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {isCreateModalOpen && (
          <EventForm
            initialData={generateInitialData()}
            categories={categories}
            isEditing={!!editingEventId}
            onSubmit={async (data: any) => {
              const iso = new Date(data.target_date).toISOString();
              if (editingEventId)
                await updateEventOptimistic({
                  ...data,
                  target_date: iso,
                  id: editingEventId,
                });
              else
                await addEventOptimistic({
                  ...data,
                  target_date: iso,
                  meta: "{}",
                });
              closeModal();
            }}
            onCancel={closeModal}
            onAddCategory={addCategoryOptimistic}
          />
        )}
      </div>
      <div
        className="modal-backdrop bg-neutral/20 backdrop-blur-sm"
        onClick={closeModal}
      >
        <button>close</button>
      </div>
    </dialog>
  );
}
