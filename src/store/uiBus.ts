import { create } from "zustand";

type Theme = "nord" | "dracula" | "system";
type ViewMode = "flat" | "grouped";

interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  eventId: number | null;
}

interface UiState {
  isCmdkOpen: boolean; // 🌟 控制 Cmdk 唤起
  isCreateModalOpen: boolean;
  editingEventId: number | null;
  theme: Theme;
  isDeleteModalOpen: boolean;
  eventToDelete: number | null;
  viewMode: ViewMode;
  contextMenu: ContextMenuState;

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
  openContextMenu: (x: number, y: number, eventId: number) => void;
  closeContextMenu: () => void;
}

export const useUiBus = create<UiState>((set) => ({
  isCmdkOpen: false,
  isCreateModalOpen: false,
  editingEventId: null,
  theme: "system",
  isDeleteModalOpen: false,
  eventToDelete: null,
  viewMode: "flat",
  contextMenu: { isOpen: false, x: 0, y: 0, eventId: null },

  openCmdk: () => set({ isCmdkOpen: true }),
  closeCmdk: () => set({ isCmdkOpen: false }),
  toggleCmdk: () => set((state) => ({ isCmdkOpen: !state.isCmdkOpen })),

  openCreateModal: () =>
    set({ isCreateModalOpen: true, editingEventId: null, isCmdkOpen: false }),
  openEditModal: (id) =>
    set({ isCreateModalOpen: true, editingEventId: id, isCmdkOpen: false }),
  closeModal: () => set({ isCreateModalOpen: false, editingEventId: null }),
  setTheme: (theme) => set({ theme }),
  openDeleteModal: (id) => set({ isDeleteModalOpen: true, eventToDelete: id }),
  closeDeleteModal: () =>
    set({ isDeleteModalOpen: false, eventToDelete: null }),
  toggleViewMode: () =>
    set((state) => ({
      viewMode: state.viewMode === "flat" ? "grouped" : "flat",
    })),
  openContextMenu: (x, y, eventId) =>
    set({ contextMenu: { isOpen: true, x, y, eventId } }),
  closeContextMenu: () =>
    set((state) => ({ contextMenu: { ...state.contextMenu, isOpen: false } })),
}));
