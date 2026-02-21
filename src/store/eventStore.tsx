import { create } from "zustand";
import toast from "react-hot-toast";
import { CheckCircle2, Trash2 } from "lucide-react";
import { AppEvent, CreateEventDto, UpdateEventDto } from "../types";
// ⚠️ 之后编译 Tauri 时解开这行注释：
// import { invoke } from '@tauri-apps/api/core';

const mockEvents: AppEvent[] = [
  {
    id: 1,
    user_id: null,
    title: "Tauri + React 项目完工",
    description: "搞定前端样式，连通 Rust 后端，准备打包给朋友炫耀一下。",
    target_date: "2026-03-01T12:00:00",
    importance: 90, // 满分 100
    category: "开发",
    meta: "{}",
  },
  {
    id: 2,
    user_id: null,
    title: "信用卡还款",
    description: "本月账单出炉了，别忘了还款，逾期要扣利息的！",
    target_date: "2026-02-28T23:59:59",
    importance: 60,
    category: "财务",
    meta: "{}",
  },
];

interface EventState {
  events: AppEvent[];
  addEventOptimistic: (dto: CreateEventDto) => void;
  updateEventOptimistic: (dto: UpdateEventDto) => void;
  deleteEventOptimistic: (id: number) => void;
}

export const useEventStore = create<EventState>((set) => ({
  events: mockEvents,

  addEventOptimistic: async (dto) => {
    /* // 真实后端调用逻辑 (解开注释使用)：
    try {
      const newId = await invoke<number>('create_event', { payload: dto });
      const newEvent = { ...dto, id: newId, user_id: null };
      set((state) => ({ events: [newEvent, ...state.events] }));
      toast('日程创建成功！', { icon: <CheckCircle2 className="w-5 h-5 text-success" /> });
    } catch (e) {
      toast.error(`创建失败: ${e}`);
    }
    */

    // 当前模拟乐观加载：
    const tempEvent: AppEvent = { ...dto, id: Date.now(), user_id: null };
    set((state) => ({ events: [tempEvent, ...state.events] }));
    toast("日程创建成功！", {
      icon: <CheckCircle2 className="w-5 h-5 text-success" />,
    });
  },

  updateEventOptimistic: async (dto) => {
    /*
    // 真实后端调用逻辑：
    try {
      await invoke('update_event', { payload: dto });
      // 更新成功后修改前端状态...
    } catch (e) {}
    */
    set((state) => ({
      events: state.events.map((e) => (e.id === dto.id ? { ...e, ...dto } : e)),
    }));
    toast("日程已更新！", {
      icon: <CheckCircle2 className="w-5 h-5 text-info" />,
    });
  },

  deleteEventOptimistic: async (id) => {
    /*
    // 真实后端调用逻辑：
    try {
      await invoke('delete_event', { id });
    } catch (e) {}
    */
    set((state) => ({ events: state.events.filter((e) => e.id !== id) }));
    toast("日程已删除", { icon: <Trash2 className="w-5 h-5 text-error" /> });
  },
}));
