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
      // 🌟 核心：移除所有冲突的 Tailwind 布局类，把舞台完全交给你的 [cmdk-dialog] CSS
      className="outline-none"
    >
      {/* 🌟 搜索栏重构：使用相对定位包裹图标，配合你 CSS 里的超大 Padding */}
      <div className="relative">
        <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-base-content/30" />
        <Command.Input
          autoFocus
          placeholder="搜索瞬间、探索回忆，或输入命令..."
          value={inputValue}
          onValueChange={setInputValue}
          // pl-20 专门给左侧的 Search 图标留出空间，pr-24 给右侧的 ESC 留空间
          className="pl-20 pr-24 font-medium tracking-wide w-full bg-transparent focus:outline-none"
        />
        <kbd className="absolute right-8 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-base-200/50 rounded-md text-xs text-base-content/40 font-bold uppercase tracking-wider border border-base-200">
          ESC
        </kbd>
      </div>

      {/* 列表区：同样去掉了 Tailwind，因为 [cmdk-list] 已经接管了 */}
      <Command.List>
        <Command.Empty>在这片星海中，没有找到匹配的瞬间...</Command.Empty>

        <Command.Group heading="快捷操作">
          <Command.Item
            onSelect={() => {
              openCreateModal();
              closeCmdk(); // 选完自动关闭面板
            }}
          >
            {/* 🌟 给每一个 Item 加上圆润的独立图标底座 */}
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
              <Plus className="w-5 h-5" />
            </div>
            <span className="font-bold tracking-wider">新建倒数日</span>
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
                  closeCmdk(); // 选完自动关闭
                }}
              >
                {/* 左侧图标底座：根据类型显示不同颜色，与卡片设计语言保持一致 */}
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full shrink-0
                  ${isAnniversary ? "bg-info/10 text-info" : "bg-warning/10 text-warning"}`}
                >
                  {isAnniversary ? (
                    <CalendarHeart className="w-5 h-5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                </div>

                {/* 右侧内容区：标题与描述分离 */}
                <div className="flex flex-col flex-1 min-w-0 justify-center gap-1">
                  <div className="flex justify-between items-center w-full">
                    <span className="font-bold text-base-content truncate text-[1.05rem] tracking-tight">
                      {event.title}
                    </span>
                  </div>

                  {/* 精致的标签与备注展示 */}
                  <div className="text-xs text-base-content/50 truncate flex items-center gap-2 w-full font-medium">
                    {event.categories.length > 0 && (
                      <span className="text-primary/70 bg-primary/10 px-2 py-0.5 rounded-md tracking-wider">
                        #{event.categories[0].name}
                      </span>
                    )}
                    <span className="truncate opacity-70">
                      {event.description || "记录时光的留白..."}
                    </span>
                  </div>
                </div>
              </Command.Item>
            );
          })}
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}
