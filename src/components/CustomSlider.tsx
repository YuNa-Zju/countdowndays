import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

interface CustomSliderProps {
  value: number; // 🌟 严格对应 0 - 10
  onChange: (val: number) => void;
}

export default function CustomSlider({ value, onChange }: CustomSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // 使用 ref 缓存 onChange，避免在 useEffect 中因依赖更新导致重复绑定
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const calculateValue = (clientX: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    // 🌟 将物理宽度映射到 0 - 10 范围
    const rawValue = Math.round((x / rect.width) * 10);
    onChangeRef.current(Math.max(0, Math.min(10, rawValue)));
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    calculateValue(e.clientX);
  };

  // 🌟 核心修复：拖拽时将事件挂载到全局 window，松手时彻底卸载
  // 这样无论鼠标滑到屏幕的哪个角落，松手都能 100% 触发释放
  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      calculateValue(e.clientX);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    // 监听移动、抬起以及系统强制取消(比如切出窗口)
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [isDragging]);

  // 🌟 动态颜色与宽度计算
  const dynamicColor = `hsl(348, ${50 + value * 5}%, ${80 - value * 3}%)`;
  const renderPercentage = value * 10;

  return (
    <div className="py-2 w-full select-none">
      <div className="flex justify-between items-center text-xs text-base-content/40 mb-3 font-bold">
        <span>无所谓 0</span>
        <span
          style={{ color: dynamicColor }}
          className="font-black text-2xl drop-shadow-sm transition-colors duration-300"
        >
          {value}
        </span>
        <span>极其紧急 10</span>
      </div>

      <div
        ref={trackRef}
        className="h-3 bg-base-200/80 rounded-full relative cursor-pointer touch-none shadow-inner"
        onPointerDown={handlePointerDown}
      >
        {/* 🌟 添加 pointer-events-none 防止内部元素拦截点击事件 */}
        <motion.div
          className="absolute top-0 left-0 h-full rounded-full pointer-events-none"
          style={{ backgroundColor: dynamicColor }}
          animate={{ width: `${renderPercentage}%` }}
          transition={{ duration: isDragging ? 0 : 0.2, ease: "easeOut" }}
        />
        <motion.div
          className="absolute top-1/2 w-6 h-6 bg-base-100 border-[3px] rounded-full shadow-md z-10 pointer-events-none"
          style={{ borderColor: dynamicColor, x: "-50%", y: "-50%" }}
          animate={{
            left: `${renderPercentage}%`,
            scale: isDragging ? 1.2 : 1,
          }}
          transition={{ duration: isDragging ? 0 : 0.2, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
