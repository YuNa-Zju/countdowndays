import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useUiBus } from "../store/uiBus";

export default function ThemeToggle() {
  const { theme, setTheme } = useUiBus();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      const isSystemDark = mediaQuery.matches;
      // 暗黑模式使用 dim，亮色模式使用 nord
      const shouldUseDark =
        theme === "dim" || (theme === "system" && isSystemDark);
      setIsDark(shouldUseDark);
      document.documentElement.setAttribute(
        "data-theme",
        shouldUseDark ? "dim" : "nord",
      );
    };
    applyTheme();
    mediaQuery.addEventListener("change", applyTheme);
    return () => mediaQuery.removeEventListener("change", applyTheme);
  }, [theme]);

  const toggleTheme = () => setTheme(isDark ? "nord" : "dim");

  return (
    <label className="swap swap-rotate btn btn-ghost btn-circle">
      <input
        type="checkbox"
        checked={isDark}
        onChange={toggleTheme}
        className="theme-controller hidden"
      />
      {/* 亮色模式显示太阳 */}
      <Sun className="swap-off h-5 w-5 text-base-content" />
      {/* 暗色模式显示月亮 */}
      <Moon className="swap-on h-5 w-5 text-base-content" />
    </label>
  );
}
