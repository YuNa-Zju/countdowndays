import { useState, useRef, useEffect } from "react";
import {
  Plus,
  X,
  CalendarHeart,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useUiBus } from "../store/uiBus";
import { useEventStore } from "../store/eventStore";
import CustomSlider from "./CustomSlider";
import { format } from "date-fns";
import { Category } from "../types";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================================
// 1. 旗舰级样式系统：去线框化、大圆角、光效拟物
// ============================================================================
const styles = {
  input:
    "appearance-none w-full box-border block bg-base-200/40 border-2 border-transparent rounded-2xl px-5 py-3.5 text-base text-base-content font-medium focus:outline-none focus:bg-base-100 focus:border-primary/30 focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-primary)_10%,transparent)] transition-all placeholder:text-base-content/30",
  label:
    "block text-xs font-black text-base-content/40 uppercase tracking-[0.15em] mb-3 ml-1",
  card: "bg-base-100/50 p-6 rounded-[2rem] border border-base-200/50 flex flex-col w-full h-full",
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
    <div className="flex justify-between items-center mb-6">
      <h4 className="text-sm font-black text-base-content uppercase tracking-widest">
        基础信息
      </h4>
      <div className="flex bg-base-200/60 p-1 rounded-xl shrink-0 border border-base-200">
        <button
          type="button"
          className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
            formData.event_type === "task"
              ? "bg-base-100 shadow-sm text-warning scale-100"
              : "text-base-content/40 hover:text-base-content/70 scale-95"
          }`}
          onClick={() => updateField("event_type", "task")}
        >
          <CheckCircle2 className="w-3.5 h-3.5" /> 任务
        </button>
        <button
          type="button"
          className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
            formData.event_type === "anniversary"
              ? "bg-base-100 shadow-sm text-info scale-100"
              : "text-base-content/40 hover:text-base-content/70 scale-95"
          }`}
          onClick={() => updateField("event_type", "anniversary")}
        >
          <CalendarHeart className="w-3.5 h-3.5" /> 纪念日
        </button>
      </div>
    </div>

    <div className="space-y-6">
      <div className="flex flex-col">
        <label className={styles.label}>名称</label>
        <input
          required
          type="text"
          placeholder="起个名字..."
          className={`${styles.input} !text-xl !py-4 !font-bold`}
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
// 3. 标签与描述区块 (带有内嵌式删除确认)
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

  // 🌟 控制局部删除弹窗
  const [tagToDelete, setTagToDelete] = useState<Category | null>(null);

  useEffect(() => {
    if (isAddingTag) newTagInputRef.current?.focus();
  }, [isAddingTag]);

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
    <div className={`${styles.card} relative overflow-hidden`}>
      <h4 className="text-sm font-black text-base-content mb-6 uppercase tracking-widest">
        分类备注
      </h4>

      <div className="mb-6">
        <label className={styles.label}>标签</label>
        <div className="bg-base-200/30 border border-base-200 rounded-2xl p-4 flex flex-wrap gap-2.5 items-center min-h-[4rem]">
          {categories.map((cat: Category) => {
            const isSelected = formData.category_ids.includes(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={`group flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase transition-all duration-300
                  ${isSelected ? "bg-primary text-primary-content shadow-md shadow-primary/20 scale-105" : "bg-base-100 text-base-content/50 hover:bg-base-200"}`}
              >
                {cat.name}
                <X
                  className={`w-3.5 h-3.5 transition-colors ${isSelected ? "opacity-60 hover:text-white hover:opacity-100" : "opacity-0 hidden"}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setTagToDelete(cat); // 唤起局部删除弹窗
                  }}
                />
              </button>
            );
          })}

          {isAddingTag ? (
            <input
              ref={newTagInputRef}
              type="text"
              className="bg-base-100 rounded-full border border-primary/30 text-xs font-bold w-24 px-3 py-2 outline-none text-primary"
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
              className="px-4 py-2 rounded-full border border-dashed border-base-300 text-base-content/30 hover:text-primary hover:border-primary/30 transition-colors flex items-center gap-1 text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5" /> 新增
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <label className={styles.label}>详情备注</label>
        <textarea
          placeholder="写点什么..."
          className={`${styles.input} flex-1 min-h-[120px] resize-none leading-relaxed`}
          value={formData.description}
          onChange={(e) => updateField("description", e.target.value)}
        />
      </div>

      {/* 🌟 优雅的内嵌式删除确认卡片 */}
      <AnimatePresence>
        {tagToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-base-100/70 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              className="bg-base-100 border border-base-200/60 shadow-2xl rounded-3xl p-6 flex flex-col items-center text-center max-w-[260px]"
            >
              <div className="w-12 h-12 bg-error/10 text-error rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-black text-base-content mb-2">删除标签</h3>
              <p className="text-xs text-base-content/60 leading-relaxed mb-6">
                确定永久删除{" "}
                <span className="font-bold text-primary px-1">
                  #{tagToDelete.name}
                </span>{" "}
                吗？所有关联的日程将自动摘除此标签。
              </p>
              <div className="flex gap-3 w-full">
                <button
                  type="button"
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold text-xs bg-base-200/50 hover:bg-base-200 text-base-content/60 transition-colors"
                  onClick={() => setTagToDelete(null)}
                >
                  取消
                </button>
                <button
                  type="button"
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold text-xs bg-error hover:bg-error/90 text-white shadow-md shadow-error/20 transition-all"
                  onClick={() => {
                    deleteCategoryOptimistic(tagToDelete.id);
                    setTagToDelete(null);
                  }}
                >
                  删除
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// 4. 主表单与大弹窗外壳
// ============================================================================
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
      importance: 0, // 🌟 初始化修改为 0
      category_ids: [],
      event_type: "task",
    };
  };

  const [formData, setFormData] = useState(generateInitialData());

  useEffect(() => {
    if (isCreateModalOpen) {
      setFormData(generateInitialData());
    }
  }, [isCreateModalOpen, editingEventId]);

  const updateField = (field: string, value: any) =>
    setFormData((prev: any) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const iso = new Date(formData.target_date).toISOString();
    const currentEventType = formData.event_type as "task" | "anniversary";
    if (editingEventId) {
      await updateEventOptimistic({
        ...formData,
        target_date: iso,
        id: editingEventId,
        event_type: currentEventType,
      });
    } else {
      await addEventOptimistic({
        ...formData,
        target_date: iso,
        meta: "{}",
        event_type: currentEventType,
      });
    }
    closeModal();
  };

  return (
    <AnimatePresence>
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-base-300/60 backdrop-blur-xl"
            onClick={closeModal}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-5xl bg-base-100 rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-base-200/60"
          >
            <div className="px-8 py-6 flex justify-between items-center bg-base-100 z-10">
              <h3 className="font-black text-xl text-base-content tracking-tight">
                {editingEventId ? "编辑瞬间" : "创造新瞬间"}
              </h3>
              <button
                onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-base-200/50 hover:bg-base-200 text-base-content/50 hover:text-base-content transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col flex-1 min-h-0"
            >
              <div className="flex-1 overflow-y-auto px-8 pb-8 pt-2 bg-base-100">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch h-full">
                  <div className="space-y-8 flex flex-col">
                    <BasicInfoSection
                      formData={formData}
                      updateField={updateField}
                    />
                    <div className={styles.card}>
                      <h4 className="text-sm font-black text-base-content mb-4 uppercase tracking-widest">
                        重要程度
                      </h4>
                      <div className="bg-base-200/30 border border-base-200 rounded-2xl p-6 shadow-inner flex-1 flex items-center">
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
                    onAddCategory={addCategoryOptimistic}
                  />
                </div>
              </div>

              <div className="px-8 py-5 border-t border-base-200/60 bg-base-100/80 backdrop-blur-md flex justify-end items-center gap-4 shrink-0">
                <button
                  type="button"
                  className="px-6 py-3 text-sm font-bold text-base-content/40 hover:text-base-content uppercase tracking-widest transition-colors"
                  onClick={closeModal}
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-primary-content rounded-2xl px-10 py-3.5 font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all scale-100 hover:scale-105 active:scale-95"
                >
                  {editingEventId ? "保存修改" : "定格瞬间"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
