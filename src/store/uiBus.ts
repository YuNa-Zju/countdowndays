import { create } from "zustand";
// 🌟 引入 persist 持久化中间件
import { persist } from "zustand/middleware";

export type Theme =
  | "nord"
  | "dracula"
  | "system"
  | "pastel-light"
  | "pastel-dark";
type ViewMode = "flat" | "grouped";

interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  eventId: number | null;
}

interface UiState {
  isCmdkOpen: boolean;
  isCreateModalOpen: boolean;
  isNoteModalOpen: boolean;
  editingEventId: number | null;
  theme: Theme;
  isDeleteModalOpen: boolean;
  eventToDelete: number | null;
  viewMode: ViewMode;
  contextMenu: ContextMenuState;

  // 🌟 新增：记录分组的折叠/展开状态 (例如: { "Anniversary": true, "Task": false })
  expandedGroups: Record<string, boolean>;

  openCmdk: () => void;
  closeCmdk: () => void;
  toggleCmdk: () => void;

  openCreateModal: () => void;
  openEditModal: (id: number) => void;
  closeModal: () => void;
  setTheme: (theme: Theme) => void;
  openDeleteModal: (id: number) => void;
  closeDeleteModal: () => void;
  toggleViewMode: () => void;

  // 🌟 新增：切换某个分组的展开/折叠状态
  toggleGroup: (groupName: string) => void;

  openContextMenu: (x: number, y: number, eventId: number) => void;
  closeContextMenu: () => void;
  noteModalContent: { title: string; description: string } | null;
  openNoteModal: (title: string, description: string) => void;
  closeNoteModal: () => void;
}

// 🌟 使用 persist 包裹整个 store 设置
export const useUiBus = create<UiState>()(
  persist(
    (set) => ({
      isCmdkOpen: false,
      isCreateModalOpen: false,
      editingEventId: null,
      theme: "system",
      isDeleteModalOpen: false,
      eventToDelete: null,
      viewMode: "flat",
      contextMenu: { isOpen: false, x: 0, y: 0, eventId: null },
      isNoteModalOpen: false,

      // 🌟 初始状态：空对象（代表默认行为，可以在组件里判断为 undefined 时默认展开）
      expandedGroups: {},

      openCmdk: () => set({ isCmdkOpen: true }),
      closeCmdk: () => set({ isCmdkOpen: false }),
      toggleCmdk: () => set((state) => ({ isCmdkOpen: !state.isCmdkOpen })),

      openCreateModal: () =>
        set({
          isCreateModalOpen: true,
          editingEventId: null,
          isCmdkOpen: false,
        }),
      openEditModal: (id) =>
        set({ isCreateModalOpen: true, editingEventId: id, isCmdkOpen: false }),
      closeModal: () => set({ isCreateModalOpen: false, editingEventId: null }),
      setTheme: (theme) => set({ theme }),
      openDeleteModal: (id) =>
        set({ isDeleteModalOpen: true, eventToDelete: id }),
      closeDeleteModal: () =>
        set({ isDeleteModalOpen: false, eventToDelete: null }),
      toggleViewMode: () =>
        set((state) => ({
          viewMode: state.viewMode === "flat" ? "grouped" : "flat",
        })),

      // 🌟 新增的 toggle 方法：点击时反转当前的 boolean 值
      toggleGroup: (groupName) =>
        set((state) => ({
          expandedGroups: {
            ...state.expandedGroups,
            [groupName]:
              state.expandedGroups[groupName] === false ? true : false,
          },
        })),

      openContextMenu: (x, y, eventId) =>
        set({ contextMenu: { isOpen: true, x, y, eventId } }),
      closeContextMenu: () =>
        set((state) => ({
          contextMenu: { ...state.contextMenu, isOpen: false },
        })),
      noteModalContent: null,
      openNoteModal: (title, description) =>
        set({
          isNoteModalOpen: true,
          noteModalContent: { title, description },
        }),
      closeNoteModal: () =>
        set({ isNoteModalOpen: false, noteModalContent: null }),
    }),
    {
      name: "countdown-ui-storage", // 存入 localStorage 的 key 名字
      // 🌟 核心：只挑选你需要持久化的数据，不要把"弹窗打开"这种临时状态存进去！
      partialize: (state) => ({
        theme: state.theme,
        viewMode: state.viewMode,
        expandedGroups: state.expandedGroups,
      }),
    },
  ),
);
