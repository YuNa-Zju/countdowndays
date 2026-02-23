import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { useUiBus } from "../store/uiBus";
import { useEventStore } from "../store/eventStore";
import { getCurrentWindow, Window } from "@tauri-apps/api/window";

// 提取你定义好的 Theme 类型
export type Theme =
  | "nord"
  | "dracula"
  | "system"
  | "pastel-light"
  | "pastel-dark";

export function useAppBoot() {
  const { openCreateModal, theme } = useUiBus();
  const { fetchData } = useEventStore();

  const [resolvedTheme, setResolvedTheme] = useState<Exclude<Theme, "system">>(
    theme === "system" ? "pastel-light" : (theme as Exclude<Theme, "system">),
  );

  // ==========================================
  // 1. 主窗口焦点监听 (仅 main 窗口需要)
  // ==========================================
  useEffect(() => {
    const appWindow = getCurrentWindow();
    if (appWindow.label === "main") {
      const unlistenFocus = appWindow.onFocusChanged(
        async ({ payload: focused }) => {
          if (focused) {
            const fab = await Window.getByLabel("fab");
            if (fab) {
              await fab.hide();
            }
          }
        },
      );
      return () => {
        unlistenFocus.then((f) => f());
      };
    }
  }, []);

  // ==========================================
  // 2. 主题映射与系统偏好监听 (所有窗口都需要)
  // ==========================================
  useEffect(() => {
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      setResolvedTheme(mediaQuery.matches ? "pastel-dark" : "pastel-light");

      const handler = (e: MediaQueryListEvent) => {
        setResolvedTheme(e.matches ? "pastel-dark" : "pastel-light");
      };
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    } else {
      setResolvedTheme(theme as Exclude<Theme, "system">);
    }
  }, [theme]);

  // ==========================================
  // 3. 🌟 修复 Bug: 多窗口状态同步 (所有窗口都需要)
  // ==========================================
  // 把 storage 监听器移出 main 判断，这样 tray 和 fab 也能监听到 localStorage 的变化了
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      // 当主页面修改了 zustand 的持久化存储时，这里会被触发
      if (e.key === "countdown-ui-storage") {
        useUiBus.persist.rehydrate();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // ==========================================
  // 4. 数据拉取、全局快捷键拦截 (仅 main 窗口需要)
  // ==========================================
  useEffect(() => {
    const appWindow = getCurrentWindow();

    if (appWindow.label === "main") {
      // 🌟 核心防闪退机制：等待 Rust 的 db-ready 信号才能发请求！
      const unlistenDb = listen("db-ready", () => {
        fetchData();
      });

      const handleKeyDown = (e: KeyboardEvent) => {
        if (
          e.key === "F5" ||
          (e.ctrlKey && e.key.toLowerCase() === "r") ||
          (e.metaKey && e.key.toLowerCase() === "r")
        ) {
          e.preventDefault();
        }
      };

      const handleContextMenu = (e: MouseEvent) => {
        if (import.meta.env.PROD) {
          e.preventDefault();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("contextmenu", handleContextMenu);

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("contextmenu", handleContextMenu);
        // 记得清理事件监听
        unlistenDb.then((f) => f());
      };
    }
  }, [fetchData]);

  // ==========================================
  // 5. 唤醒主窗口并创建 (仅 main 窗口需要)
  // ==========================================
  useEffect(() => {
    if (getCurrentWindow().label === "main") {
      const unlisten = listen("wake-main-and-create", async () => {
        openCreateModal();
      });
      return () => {
        unlisten.then((f) => f());
      };
    }
  }, [openCreateModal]);

  return { resolvedTheme };
}
