import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { useUiBus } from "../store/uiBus";
import { useEventStore } from "../store/eventStore";
import { getCurrentWindow, Window } from "@tauri-apps/api/window";
// 提取你定义好的 Theme 类型（如果是在别的文件定义的，也可以直接 import 过来）
export type Theme =
  | "nord"
  | "dracula"
  | "system"
  | "pastel-light"
  | "pastel-dark";

export function useAppBoot() {
  const { openCreateModal, theme } = useUiBus();
  const { fetchData } = useEventStore();

  // 🌟 将解析后的主题类型排除掉 "system"，因为它最终一定会被渲染成具体的颜色配置
  const [resolvedTheme, setResolvedTheme] = useState<Exclude<Theme, "system">>(
    theme === "system" ? "pastel-light" : (theme as Exclude<Theme, "system">),
  );

  useEffect(() => {
    const appWindow = getCurrentWindow();

    // 只有 main 窗口才需要监听自己的聚焦事件
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

  // 🌟 核心映射逻辑：监听系统偏好，并分配给我们的 pastel 专属主题
  useEffect(() => {
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      // 初始判断：黑夜给 pastel-dark，白天给 pastel-light
      setResolvedTheme(mediaQuery.matches ? "pastel-dark" : "pastel-light");

      // 实时监听系统级别的切换
      const handler = (e: MediaQueryListEvent) => {
        setResolvedTheme(e.matches ? "pastel-dark" : "pastel-light");
      };
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    } else {
      setResolvedTheme(theme as Exclude<Theme, "system">);
    }
  }, [theme]);

  // ------------------------------------------------------------------
  // 下面是原有的核心启动逻辑，保持不变
  // ------------------------------------------------------------------
  useEffect(() => {
    fetchData();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "countdown-ui-storage") {
        useUiBus.persist.rehydrate();
      }
    };
    window.addEventListener("storage", handleStorage);

    const unlisten = listen("wake-main-and-create", async () => {
      openCreateModal();
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
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("contextmenu", handleContextMenu);
      unlisten.then((f) => f());
    };
  }, [fetchData, openCreateModal]);

  return { resolvedTheme };
}
