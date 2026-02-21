import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useUiBus } from "../store/uiBus";
import { useEventStore } from "../store/eventStore";
import { Plus, Calendar, Settings, Search } from "lucide-react";

export default function CommandPalette() {
  const { isCmdkOpen, closeCmdk, toggleCmdk, openCreateModal, openEditModal } =
    useUiBus();
  const { events } = useEventStore();
  const [inputValue, setInputValue] = useState("");

  // 监听快捷键 Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleCmdk();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggleCmdk]);

  if (!isCmdkOpen) return null;

  return (
    <Command.Dialog
      open={isCmdkOpen}
      onOpenChange={closeCmdk}
      className="bg-base-100 rounded-2xl shadow-2xl border border-base-200 overflow-hidden w-[90vw] max-w-xl outline-none"
    >
      <div className="flex items-center px-4 border-b border-base-200">
        <Search className="w-5 h-5 text-base-content/40 shrink-0" />
        <Command.Input
          autoFocus
          placeholder="搜索日程、描述、标签，或输入命令..."
          value={inputValue}
          onValueChange={setInputValue}
          className="w-full bg-transparent border-none focus:outline-none focus:ring-0 px-3 py-4 text-base-content text-base"
        />
        <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-base-200 rounded text-xs text-base-content/50 font-sans">
          ESC
        </kbd>
      </div>

      <Command.List className="max-h-[60vh] overflow-y-auto p-2 scroll-smooth">
        <Command.Empty>没有找到相关内容...</Command.Empty>

        <Command.Group heading="快捷操作">
          <Command.Item
            onSelect={openCreateModal}
            className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer aria-selected:bg-primary/10 aria-selected:text-primary transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>新建倒数日</span>
          </Command.Item>
        </Command.Group>

        <Command.Group heading="我的日程">
          {events.map((event) => {
            // 🌟 复合搜索的魔法：把标题、描述、所有的分类名拼接成一个长字符串，喂给 cmdk 去匹配
            const searchTerms = `${event.title} ${event.description} ${event.categories.map((c) => c.name).join(" ")}`;

            return (
              <Command.Item
                key={event.id}
                value={searchTerms} // 匹配所用文本
                onSelect={() => openEditModal(event.id)}
                className="flex flex-col gap-1 px-4 py-3 rounded-xl cursor-pointer aria-selected:bg-base-200 transition-colors mb-1"
              >
                <div className="flex justify-between items-center w-full">
                  <span className="font-medium text-base-content">
                    {event.title}
                  </span>
                  <span className="text-xs badge badge-sm">
                    {event.event_type === "task" ? "任务" : "纪念日"}
                  </span>
                </div>
                {/* 如果有匹配到标签或者描述，可以这里稍微展示一下 */}
                <div className="text-xs text-base-content/50 truncate flex items-center gap-2 w-full">
                  {event.categories.length > 0 && (
                    <span className="text-primary font-medium">
                      #{event.categories[0].name}
                    </span>
                  )}
                  <span className="truncate">
                    {event.description || "无备注"}
                  </span>
                </div>
              </Command.Item>
            );
          })}
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}
