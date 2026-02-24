import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { useUiBus } from "../store/uiBus";
import { useEventStore } from "../store/eventStore";
import { getCurrentWindow, Window } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";
import { check } from "@tauri-apps/plugin-updater";

export type Theme =
  | "nord"
  | "dracula"
  | "system"
  | "pastel-light"
  | "pastel-dark";

// ==========================================
// 🌟 全局生命周期标志：
// 一旦变成 true，除非用户在托盘右键彻底退出杀掉进程，否则绝不会再变回 false。
// ==========================================
let hasPromptedUpdateThisSession = false;
let isCheckingUpdate = false;

export function useAppBoot() {
  const { openCreateModal, theme } = useUiBus();
  const { fetchData } = useEventStore();

  const [resolvedTheme, setResolvedTheme] = useState<Exclude<Theme, "system">>(
    theme === "system" ? "pastel-light" : (theme as Exclude<Theme, "system">),
  );

  // ==========================================
  // 1. 🌟 主窗口焦点监听 & 极简更新检查逻辑
  // ==========================================
  useEffect(() => {
    const appWindow = getCurrentWindow();

    if (appWindow.label === "main") {
      const checkUpdateSilently = async () => {
        if (!useUiBus.getState().autoCheckUpdate) {
          return;
        }
        // 如果本次软件运行期间已经提示过，直接无视，哪怕被反复呼出
        // （等我们一会儿加了开关，只需要在这里多加一个判断： if (!autoUpdate) return; 即可）
        if (hasPromptedUpdateThisSession || isCheckingUpdate) return;

        isCheckingUpdate = true;
        try {
          const update = await check();
          if (update) {
            console.log(`🎉 发现新版本: ${update.version}`);
            hasPromptedUpdateThisSession = true; // 🌟 永久封印本轮弹窗
            useUiBus.getState().openUpdateModal(update);
          }
        } catch (error) {
          console.error("检查更新失败:", error);
        } finally {
          isCheckingUpdate = false;
        }
      };

      // 软件刚启动时查一次
      checkUpdateSilently();

      // 监听焦点：每次唤醒窗口时尝试检查（如果还没弹过的话）
      const unlistenFocus = appWindow.onFocusChanged(
        async ({ payload: focused }) => {
          if (focused) {
            const fab = await Window.getByLabel("fab");
            if (fab) {
              await fab.hide();
            }
            checkUpdateSilently();
          }
        },
      );

      return () => {
        unlistenFocus.then((f) => f());
      };
    }
  }, []);

  // ==========================================
  // 2. 主题映射与系统偏好监听
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
  // 3. 多窗口状态同步
  // ==========================================
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "countdown-ui-storage") {
        useUiBus.persist.rehydrate();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // ==========================================
  // 4. 数据拉取、全局快捷键拦截
  // ==========================================
  useEffect(() => {
    const appWindow = getCurrentWindow();

    if (appWindow.label === "main") {
      // 🌟 1. 核心逻辑：定义如何安全地拿数据
      const initializeData = async () => {
        try {
          // 先问问后端：数据库初始化好了吗？
          const isReady = await invoke<boolean>("is_db_initialized");

          if (isReady) {
            console.log("✅ 数据库已就绪，直接拉取数据");
            await fetchData();
          } else {
            console.log("⏳ 数据库连接中，等待信号...");
          }
        } catch (error) {
          // 如果命令本身还没注册，这里会报错，没关系，等信号即可
        }
      };

      // 启动或刷新时，先自查一次
      initializeData();

      // 🌟 2. 信号补位：如果自查时还没好，等这个信号
      const unlistenDbPromise = listen("db-ready", () => {
        console.log("📢 收到 db-ready 信号，开始拉取数据");
        fetchData();
      });

      // --- 下面是原来的快捷键逻辑 ---
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
        if (import.meta.env.PROD) e.preventDefault();
      };

      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("contextmenu", handleContextMenu);

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("contextmenu", handleContextMenu);
        unlistenDbPromise.then((unlisten) => unlisten());
      };
    }
  }, [fetchData]);

  // ==========================================
  // 5. 唤醒主窗口并创建
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
