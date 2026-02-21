import { invoke } from "@tauri-apps/api/core";
import { AppEvent, Category, CreateEventDto, UpdateEventDto } from "../types";

const IS_MOCK =
  typeof window !== "undefined" && !("__TAURI_INTERNALS__" in window);
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

// --- LocalStorage 持久化逻辑 ---
const STORAGE_KEY_EVENTS = "momentary_mock_events";
const STORAGE_KEY_CATS = "momentary_mock_categories";

// 默认假数据
const defaultCategories: Category[] = [
  { id: 1, name: "开发" },
  { id: 2, name: "生活" },
  { id: 3, name: "财务" },
];

const defaultEvents: AppEvent[] = [
  {
    id: 1,
    user_id: null,
    title: "Tauri + React 项目完工",
    description: "搞定前端样式，连通 Rust 后端。",
    target_date: "2026-03-01T12:00:00.000Z",
    importance: 90,
    event_type: "task",
    meta: "{}",
    categories: [defaultCategories[0]],
  },
];

// 初始化读取
let mockCategories: Category[] =
  JSON.parse(localStorage.getItem(STORAGE_KEY_CATS) || "null") ||
  defaultCategories;
let mockEvents: AppEvent[] =
  JSON.parse(localStorage.getItem(STORAGE_KEY_EVENTS) || "null") ||
  defaultEvents;

const saveMockData = () => {
  localStorage.setItem(STORAGE_KEY_CATS, JSON.stringify(mockCategories));
  localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(mockEvents));
};
// ------------------------------

const api = {
  async getAllEvents(): Promise<AppEvent[]> {
    if (IS_MOCK) {
      await delay();
      return [...mockEvents];
    }
    return await invoke<AppEvent[]>("get_all_events");
  },

  async getAllCategories(): Promise<Category[]> {
    if (IS_MOCK) {
      await delay();
      return [...mockCategories];
    }
    return await invoke<Category[]>("get_all_categories");
  },

  async createEvent(dto: CreateEventDto): Promise<number> {
    if (IS_MOCK) {
      await delay();
      const newId = Date.now();
      const selectedCats = dto.category_ids
        .map((id) => mockCategories.find((c) => c.id === id)!)
        .filter(Boolean);
      mockEvents = [
        { ...dto, id: newId, user_id: null, categories: selectedCats },
        ...mockEvents,
      ];
      saveMockData(); // 🌟 保存
      return newId;
    }
    return await invoke<number>("create_event", { payload: dto });
  },

  async updateEvent(dto: UpdateEventDto): Promise<void> {
    if (IS_MOCK) {
      await delay();
      mockEvents = mockEvents.map((e) => {
        if (e.id === dto.id) {
          const updated = { ...e, ...dto } as AppEvent;
          if (dto.category_ids)
            updated.categories = dto.category_ids
              .map((id) => mockCategories.find((c) => c.id === id)!)
              .filter(Boolean);
          return updated;
        }
        return e;
      });
      saveMockData(); // 🌟 保存
      return;
    }
    return await invoke("update_event", { payload: dto });
  },

  async deleteEvent(id: number): Promise<void> {
    if (IS_MOCK) {
      await delay();
      mockEvents = mockEvents.filter((e) => e.id !== id);
      saveMockData(); // 🌟 保存
      return;
    }
    return await invoke("delete_event", { id });
  },

  async createCategory(name: string): Promise<number> {
    if (IS_MOCK) {
      await delay();
      const newId = Date.now();
      mockCategories = [...mockCategories, { id: newId, name }];
      saveMockData(); // 🌟 保存
      return newId;
    }
    return await invoke<number>("create_category", { name });
  },
  async deleteCategory(id: number): Promise<void> {
    if (IS_MOCK) {
      await delay();
      mockCategories = mockCategories.filter((c) => c.id !== id);
      // 同时也模拟删除日程中的关联
      mockEvents = mockEvents.map((e) => ({
        ...e,
        categories: e.categories.filter((c) => c.id !== id),
      }));
      saveMockData();
      return;
    }
    return await invoke("delete_category", { id });
  },
};

export default api;
