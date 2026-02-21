import { Menu, Search, CalendarHeart } from "lucide-react";
import { useUiBus } from "../store/uiBus";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const { openCmdk } = useUiBus();

  return (
    <div className="navbar bg-base-100 shadow-sm sticky top-0 z-50">
      <div className="navbar-start">
        {/* <button className="btn btn-ghost btn-circle"> */}
        {/*   <Menu className="w-5 h-5" /> */}
        {/* </button> */}
      </div>
      <div className="navbar-center gap-2">
        <CalendarHeart className="text-primary w-6 h-6" />
        <a className="text-xl font-bold text-base-content">Momentary</a>
      </div>
      <div className="navbar-end gap-3">
        {/* 🌟 Cmdk 唤起按钮 */}
        <button
          onClick={openCmdk}
          className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-base-200 hover:bg-base-300 rounded-full transition-colors border border-base-300 shadow-inner"
        >
          <Search className="w-4 h-4 text-base-content/50" />
          <span className="text-sm text-base-content/60 font-medium">
            搜索...
          </span>
          <kbd className="ml-4 font-sans text-xs bg-base-100 px-1.5 py-0.5 rounded shadow-sm text-base-content/50 border border-base-200">
            ⌘K
          </kbd>
        </button>

        {/* 移动端只显示一个放大镜图标 */}
        <button
          onClick={openCmdk}
          className="btn btn-ghost btn-circle md:hidden"
        >
          <Search className="w-5 h-5 text-base-content/70" />
        </button>

        <ThemeToggle />
      </div>
    </div>
  );
}
