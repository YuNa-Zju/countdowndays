import { invoke } from "@tauri-apps/api/core";
import { AppEvent, Category, CreateEventDto, UpdateEventDto } from "../types";

// 🌟 更加稳妥的环境检测：防止测试环境报错
const IS_MOCK =
  typeof window !== "undefined" && !("__TAURI_INTERNALS__" in window);
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

let mockCategories: Category[] = [
  { id: 1, name: "开发" },
  { id: 2, name: "生活" },
  { id: 3, name: "财务" },
];

// 初始化假数据
let mockEvents: AppEvent[] = [
  {
    id: 1,
    user_id: null,
    title: "Tauri + React 项目完工",
    description: "搞定前端样式，连通 Rust 后端，准备打包给朋友炫耀一下。",
    target_date: "2026-03-01T12:00:00.000Z",
    importance: 90,
    event_type: "task",
    meta: "{}",
    categories: [mockCategories[0]], // 关联了 开发
  },
  {
    id: 2,
    user_id: null,
    title: "距离退休",
    description: "早日财富自由！",
    target_date: "2030-01-01T00:00:00.000Z",
    importance: 50,
    event_type: "anniversary",
    meta: "{}",
    categories: [mockCategories[1], mockCategories[2]], // 关联了 生活、财务
  },
];

const api = {
  async getAllEvents(): Promise<AppEvent[]> {
    if (IS_MOCK) {
      await delay();
      return [...mockEvents];
    }
    return await invoke<AppEvent[]>("get_all_events"); // 🌟 加上 await 更稳妥
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
      return;
    }
    return await invoke("update_event", { payload: dto });
  },
  async deleteEvent(id: number): Promise<void> {
    if (IS_MOCK) {
      await delay();
      mockEvents = mockEvents.filter((e) => e.id !== id);
      return;
    }
    return await invoke("delete_event", { id });
  },
  async createCategory(name: string): Promise<number> {
    if (IS_MOCK) {
      await delay();
      const newId = Date.now();
      mockCategories = [...mockCategories, { id: newId, name }];
      return newId;
    }
    return await invoke<number>("create_category", { name });
  },
};

export default api;
