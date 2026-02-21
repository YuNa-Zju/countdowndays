import { create } from "zustand";
import toast from "react-hot-toast";
import { CheckCircle2, Trash2, XCircle } from "lucide-react";
import { AppEvent, CreateEventDto, UpdateEventDto, Category } from "../types";
import api from "../services/api";

interface EventState {
  events: AppEvent[];
  categories: Category[];
  fetchData: () => Promise<void>;
  addEventOptimistic: (dto: CreateEventDto) => Promise<void>;
  updateEventOptimistic: (dto: UpdateEventDto) => Promise<void>;
  deleteEventOptimistic: (id: number) => Promise<void>;
  addCategoryOptimistic: (name: string) => Promise<number>;
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  categories: [],

  fetchData: async () => {
    try {
      // 通过 API 并发获取数据，管它是 Mock 还是 Rust，这里一概不管！
      const [events, categories] = await Promise.all([
        api.getAllEvents(),
        api.getAllCategories(),
      ]);
      set({ events, categories });
    } catch (error) {
      console.error("数据加载失败:", error);
      toast.error("数据加载失败，请检查数据库连接", {
        icon: <XCircle className="w-5 h-5 text-error" />,
      });
    }
  },

  addEventOptimistic: async (dto) => {
    try {
      const newId = await api.createEvent(dto);

      const allCats = get().categories;
      const selectedCats = dto.category_ids
        .map((id) => allCats.find((c) => c.id === id)!)
        .filter(Boolean);
      const newEvent: AppEvent = {
        ...dto,
        id: newId,
        user_id: null,
        categories: selectedCats,
      };

      set((state) => ({ events: [newEvent, ...state.events] }));
      toast("日程创建成功！", {
        icon: <CheckCircle2 className="w-5 h-5 text-success" />,
      });
    } catch (error) {
      console.error("创建日程失败:", error);
      toast.error("创建失败", {
        icon: <XCircle className="w-5 h-5 text-error" />,
      });
    }
  },

  updateEventOptimistic: async (dto) => {
    try {
      await api.updateEvent(dto);

      const allCats = get().categories;
      set((state) => ({
        events: state.events.map((e) => {
          if (e.id === dto.id) {
            const updated = { ...e, ...dto } as AppEvent;
            if (dto.category_ids) {
              updated.categories = dto.category_ids
                .map((id) => allCats.find((c) => c.id === id)!)
                .filter(Boolean);
            }
            return updated;
          }
          return e;
        }),
      }));
      toast("日程已更新！", {
        icon: <CheckCircle2 className="w-5 h-5 text-info" />,
      });
    } catch (error) {
      console.error("更新日程失败:", error);
      toast.error("更新失败", {
        icon: <XCircle className="w-5 h-5 text-error" />,
      });
    }
  },

  deleteEventOptimistic: async (id) => {
    try {
      await api.deleteEvent(id);
      set((state) => ({ events: state.events.filter((e) => e.id !== id) }));
      toast("日程已删除", { icon: <Trash2 className="w-5 h-5 text-error" /> });
    } catch (error) {
      console.error("删除日程失败:", error);
      toast.error("删除失败", {
        icon: <XCircle className="w-5 h-5 text-error" />,
      });
    }
  },

  addCategoryOptimistic: async (name) => {
    try {
      const newId = await api.createCategory(name);
      set((state) => ({
        categories: [...state.categories, { id: newId, name }],
      }));
      return newId;
    } catch (error) {
      console.error("新建分类失败:", error);
      toast.error("标签创建失败", {
        icon: <XCircle className="w-5 h-5 text-error" />,
      });
      throw error;
    }
  },
}));
