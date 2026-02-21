import { Menu, Search, CalendarHeart } from "lucide-react";
import { useUiBus } from "../store/uiBus";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const { searchQuery, setSearchQuery } = useUiBus();

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
      <div className="navbar-end gap-2">
        <div className="form-control hidden md:block">
          <label className="input input-bordered input-sm flex items-center gap-2 rounded-full bg-base-200 focus-within:bg-base-100 transition-colors">
            <Search className="w-4 h-4 opacity-50" />
            <input
              type="text"
              placeholder="搜索日程..."
              className="w-48"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </label>
        </div>
        <ThemeToggle />
      </div>
    </div>
  );
}
