import { create } from "zustand";

type Theme = "nord" | "dim" | "system";
type ViewMode = "flat" | "grouped";

interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  eventId: number | null;
}

interface UiState {
  searchQuery: string;
  isCreateModalOpen: boolean;
  editingEventId: number | null; // null 表示新建，有值表示编辑
  theme: Theme;
  isDeleteModalOpen: boolean;
  eventToDelete: number | null;
  viewMode: ViewMode;
  contextMenu: ContextMenuState;

  setSearchQuery: (query: string) => void;
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
  searchQuery: "",
  isCreateModalOpen: false,
  editingEventId: null,
  theme: "system",
  isDeleteModalOpen: false,
  eventToDelete: null,
  viewMode: "flat",
  contextMenu: { isOpen: false, x: 0, y: 0, eventId: null },

  setSearchQuery: (query) => set({ searchQuery: query }),
  openCreateModal: () => set({ isCreateModalOpen: true, editingEventId: null }),
  openEditModal: (id) => set({ isCreateModalOpen: true, editingEventId: id }),
  closeModal: () => set({ isCreateModalOpen: false, editingEventId: null }),
  setTheme: (theme) => set({ theme }),
  openDeleteModal: (id) => set({ isDeleteModalOpen: true, eventToDelete: id }),
  closeDeleteModal: () =>
    set({ isDeleteModalOpen: false, eventToDelete: null }),
  toggleViewMode: () =>
    set((state) => ({
      viewMode: state.viewMode === "flat" ? "grouped" : "flat",
    })),

  // 菜单在被开启时会自动关闭现有的，并更新坐标
  openContextMenu: (x, y, eventId) =>
    set({ contextMenu: { isOpen: true, x, y, eventId } }),
  closeContextMenu: () =>
    set((state) => ({ contextMenu: { ...state.contextMenu, isOpen: false } })),
}));
