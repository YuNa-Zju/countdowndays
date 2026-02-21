import { create } from "zustand";

type Theme = "pastel" | "dim" | "system";
type ViewMode = "flat" | "grouped";

interface UiState {
  searchQuery: string;
  isCreateModalOpen: boolean;
  editingEventId: number | null;
  theme: Theme;
  isDeleteModalOpen: boolean;
  eventToDelete: number | null;
  viewMode: ViewMode;

  setSearchQuery: (query: string) => void;
  openCreateModal: () => void;
  openEditModal: (id: number) => void;
  closeModal: () => void;
  setTheme: (theme: Theme) => void;
  openDeleteModal: (id: number) => void;
  closeDeleteModal: () => void;
  toggleViewMode: () => void;
}

export const useUiBus = create<UiState>((set) => ({
  searchQuery: "",
  isCreateModalOpen: false,
  editingEventId: null,
  theme: "system",
  isDeleteModalOpen: false,
  eventToDelete: null,
  viewMode: "flat",

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
}));
