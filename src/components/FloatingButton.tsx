import { Plus } from "lucide-react";
import { useUiBus } from "../store/uiBus";

export default function FloatingButton() {
  const { openCreateModal } = useUiBus();

  return (
    <button
      onClick={openCreateModal}
      className="btn btn-primary btn-circle btn-lg fixed bottom-6 right-6 hover:scale-105 transition-transform border-4 border-base-100"
    >
      <Plus className="w-8 h-8" />
    </button>
  );
}
