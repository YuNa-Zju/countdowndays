import { create } from "zustand";
import toast from "react-hot-toast";
import { AppEvent } from "../types";

const mockEvents: AppEvent[] = [
  {
    id: 1,
    user_id: null,
    title: "Tauri + React 项目完工",
    description: "搞定前端样式，连通 Rust 后端，准备打包给朋友炫耀一下。",
    target_date: "2026-03-01T12:00:00",
    importance: 3,
    category: "开发",
    meta: "{}",
  },
  {
    id: 2,
    user_id: null,
    title: "信用卡还款",
    description: "本月账单出炉了，别忘了还款，逾期要扣利息的！",
    target_date: "2026-02-28T23:59:59",
    importance: 2,
    category: "财务",
    meta: "{}",
  },
  {
    id: 3,
    user_id: null,
    title: "购买新键盘",
    description: "看中了那把 75% 配列的铝坨坨，等发工资就拿下。",
    target_date: "2026-05-20T00:00:00",
    importance: 1,
    category: "生活",
    meta: "{}",
  },
];

interface EventState {
  events: AppEvent[];
  addEventOptimistic: (dto: Omit<AppEvent, "id" | "user_id">) => void;
  deleteEventOptimistic: (id: number) => void;
}

export const useEventStore = create<EventState>((set) => ({
  events: mockEvents,

  addEventOptimistic: (dto) => {
    const tempEvent: AppEvent = { ...dto, id: Date.now(), user_id: null };
    set((state) => ({ events: [tempEvent, ...state.events] }));
    toast.success("日程创建成功！", {
      icon: "✨",
      style: {
        borderRadius: "100px",
        background: "var(--fallback-b1,oklch(var(--b1)))",
        color: "var(--fallback-bc,oklch(var(--bc)))",
      },
    });
  },

  deleteEventOptimistic: (id) => {
    set((state) => ({ events: state.events.filter((e) => e.id !== id) }));
    toast.success("日程已删除", {
      icon: "🗑️",
      style: {
        borderRadius: "100px",
        background: "var(--fallback-b1,oklch(var(--b1)))",
        color: "var(--fallback-bc,oklch(var(--bc)))",
      },
    });
  },
}));
