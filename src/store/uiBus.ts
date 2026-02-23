import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Update } from "@tauri-apps/plugin-updater";

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
  expandedGroups: Record<string, boolean>;

  // 🌟 2. 增加更新相关的状态和方法
  isUpdateModalOpen: boolean;
  updateInfo: Update | null;

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
  toggleGroup: (groupName: string) => void;
  openContextMenu: (x: number, y: number, eventId: number) => void;
  closeContextMenu: () => void;
  noteModalContent: { title: string; description: string } | null;
  openNoteModal: (title: string, description: string) => void;
  closeNoteModal: () => void;

  // 🌟 3. 增加更新相关的方法签名
  openUpdateModal: (info: Update) => void;
  closeUpdateModal: () => void;
}

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
      expandedGroups: {},

      // 🌟 4. 初始化更新状态
      isUpdateModalOpen: false,
      updateInfo: null,

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

      // 🌟 5. 实现打开和关闭更新弹窗的方法
      openUpdateModal: (update) =>
        set({ isUpdateModalOpen: true, updateInfo: update }),
      closeUpdateModal: () =>
        set({ isUpdateModalOpen: false, updateInfo: null }),
    }),
    {
      name: "countdown-ui-storage",
      partialize: (state) => ({
        theme: state.theme,
        viewMode: state.viewMode,
        expandedGroups: state.expandedGroups,
      }),
    },
  ),
);
