import { useState, useEffect } from "react";

export function usePlatform() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // 1. 确认在 Tauri 环境内
    const isTauri = "__TAURI_INTERNALS__" in window;
    // 2. 通过 userAgent 排除移动端 (Android / iOS)
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );

    setIsDesktop(isTauri && !isMobile);
  }, []);

  return { isDesktop };
}
