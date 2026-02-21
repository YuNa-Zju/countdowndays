import { useEffect, useState } from "react";
import { useUiBus } from "../store/uiBus";
import { motion } from "framer-motion";

export default function ThemeToggle() {
  const { theme, setTheme } = useUiBus();
  const [isDark, setIsDark] = useState(false);

  // 监听系统主题或手动设置的主题
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const isSystemDark = mediaQuery.matches;
      const shouldUseDark =
        theme === "dim" || (theme === "system" && isSystemDark);

      setIsDark(shouldUseDark);
      // 动态修改 HTML 标签的 data-theme 属性，DaisyUI 会自动切换全局颜色
      document.documentElement.setAttribute(
        "data-theme",
        shouldUseDark ? "dim" : "pastel",
      );
    };

    applyTheme();
    mediaQuery.addEventListener("change", applyTheme);
    return () => mediaQuery.removeEventListener("change", applyTheme);
  }, [theme]);

  const toggleTheme = () => {
    // 简单地在 明/暗 之间切换，你也可以拓展为带有 'system' 选项的下拉菜单
    setTheme(isDark ? "pastel" : "dim");
  };

  return (
    <motion.label
      className="swap swap-rotate btn btn-ghost btn-circle"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <input
        type="checkbox"
        checked={isDark}
        onChange={toggleTheme}
        className="theme-controller hidden"
      />

      {/* 太阳图标 (浅色模式显示) */}
      <svg
        className="swap-off h-6 w-6 fill-current text-amber-500"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
      >
        <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
      </svg>

      {/* 月亮图标 (深色模式显示) */}
      <svg
        className="swap-on h-6 w-6 fill-current text-indigo-400"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
      >
        <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
      </svg>
    </motion.label>
  );
}
