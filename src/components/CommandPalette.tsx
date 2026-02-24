import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useUiBus } from "../store/uiBus";
import { useEventStore } from "../store/eventStore";
import { Plus, Search, CalendarHeart, CheckCircle2 } from "lucide-react";

export default function CommandPalette() {
  const { isCmdkOpen, closeCmdk, toggleCmdk, openCreateModal, openEditModal } =
    useUiBus();
  const { events } = useEventStore();
  const [inputValue, setInputValue] = useState("");

  // 🌟 监听快捷键 Cmd+K 以及 ESC 关闭
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleCmdk();
      }
      if (e.key === "Escape" && isCmdkOpen) {
        closeCmdk();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggleCmdk, isCmdkOpen, closeCmdk]);

  if (!isCmdkOpen) return null;

  return (
    // 🌟 1. 我们自己手写的全屏遮罩，彻底告别 Portal 带来的主题丢失问题！
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      {/* 沉浸式毛玻璃背景 */}
      <div
        className="absolute inset-0 bg-neutral/30 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={closeCmdk}
      />

      {/* 🌟 2. 核心弹窗：纯 Tailwind 打造的旗舰级卡片 */}
      <Command
        className="relative w-full max-w-2xl bg-base-100 rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border border-base-200/80 overflow-hidden flex flex-col animate-in fade-in zoom-in-[0.98] duration-200
        /* 魔法：利用 Tailwind 的任意子代选择器直接控制内部分组标题的样式，无需写 CSS！ */
        [&_[cmdk-group-heading]]:px-5 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:text-base-content/40 [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:uppercase
        "
      >
        {/* 🔍 顶部搜索区 */}
        <div className="flex items-center border-b border-base-200/60 px-2">
          <Search className="w-6 h-6 text-base-content/40 shrink-0 ml-4" />
          <Command.Input
            autoFocus
            value={inputValue}
            onValueChange={setInputValue}
            placeholder="搜索瞬间、探索回忆，或输入命令..."
            className="flex-1 h-20 bg-transparent border-none outline-none focus:ring-0 text-[1.15rem] font-medium px-4 text-base-content placeholder:text-base-content/30"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 mr-4 bg-base-200/50 rounded-lg text-xs text-base-content/40 font-bold uppercase tracking-widest border border-base-200">
            ESC
          </kbd>
        </div>

        {/* 📜 列表滚动区 */}
        <Command.List className="max-h-[55vh] overflow-y-auto p-3 overscroll-contain">
          <Command.Empty className="py-16 text-center text-sm font-medium text-base-content/40">
            在这片星海中，没有找到匹配的瞬间...
          </Command.Empty>

          <Command.Group heading="快捷操作">
            <Command.Item
              onSelect={() => {
                openCreateModal();
                closeCmdk();
              }}
              // 🌟 3. 极其优雅的选中高光：利用 aria-selected 原生伪类！
              className="group flex items-center gap-4 px-4 py-3 mb-1 rounded-2xl cursor-pointer text-base-content aria-selected:bg-primary/10 aria-selected:text-primary aria-selected:scale-[0.99] transition-all duration-200 ease-out"
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-base-200 text-base-content/50 group-aria-selected:bg-primary/20 group-aria-selected:text-primary shrink-0 transition-colors">
                <Plus className="w-6 h-6" />
              </div>
              <span className="font-bold tracking-wide text-[1.05rem]">
                新建倒数日
              </span>
            </Command.Item>
          </Command.Group>

          <Command.Group heading="我的瞬间">
            {events.map((event) => {
              const searchTerms = `${event.title} ${event.description} ${event.categories.map((c) => c.name).join(" ")}`;
              const isAnniversary = event.event_type === "anniversary";

              return (
                <Command.Item
                  key={event.id}
                  value={searchTerms}
                  onSelect={() => {
                    openEditModal(event.id);
                    closeCmdk();
                  }}
                  className="group flex items-center gap-4 px-4 py-3 mb-1 rounded-2xl cursor-pointer text-base-content aria-selected:bg-primary/10 aria-selected:text-primary aria-selected:scale-[0.99] transition-all duration-200 ease-out"
                >
                  {/* 精致的动态图标底座 */}
                  <div
                    className={`w-12 h-12 flex items-center justify-center rounded-2xl shrink-0 transition-colors duration-200
                    ${
                      isAnniversary
                        ? "bg-info/10 text-info group-aria-selected:bg-info/20"
                        : "bg-warning/10 text-warning group-aria-selected:bg-warning/20"
                    }`}
                  >
                    {isAnniversary ? (
                      <CalendarHeart className="w-6 h-6" />
                    ) : (
                      <CheckCircle2 className="w-6 h-6" />
                    )}
                  </div>

                  {/* 标题与描述信息流 */}
                  <div className="flex flex-col flex-1 min-w-0 justify-center gap-0.5">
                    <span className="font-bold text-[1.05rem] truncate">
                      {event.title}
                    </span>
                    <div className="flex items-center gap-2 text-xs opacity-60 truncate font-medium mt-0.5">
                      {event.categories.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-base-content/10 group-aria-selected:bg-primary/20 transition-colors">
                          #{event.categories[0].name}
                        </span>
                      )}
                      <span className="truncate">
                        {event.description || "记录时光的留白..."}
                      </span>
                    </div>
                  </div>
                </Command.Item>
              );
            })}
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
