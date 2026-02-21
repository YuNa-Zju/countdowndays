import { useRef, useState } from "react";
import { motion } from "framer-motion";

interface CustomSliderProps {
  value: number; // 1 - 100
  onChange: (val: number) => void;
}

export default function CustomSlider({ value, onChange }: CustomSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const calculateValue = (clientX: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = Math.round((x / rect.width) * 100);
    onChange(Math.max(1, Math.min(100, percentage))); // 严格限制在 1-100
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    calculateValue(e.clientX);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) calculateValue(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const dynamicColor = `hsl(348, ${50 + value / 2}%, ${80 - value / 2.5}%)`;

  return (
    <div className="py-2">
      <div className="flex justify-between text-xs text-base-content/50 mb-3 font-medium">
        <span>普通</span>
        <span style={{ color: dynamicColor }} className="font-bold text-sm">
          {value}
        </span>
        <span>极其紧急</span>
      </div>

      <div
        ref={trackRef}
        className="h-2 bg-base-200/70 rounded-full relative cursor-pointer touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* 填充条 */}
        <motion.div
          className="absolute top-0 left-0 h-full rounded-full"
          style={{ backgroundColor: dynamicColor }}
          animate={{ width: `${value}%` }}
          /* 🌟 核心修复：拖拽时 duration 为 0 实现瞬间跟手，松手时才有过渡 */
          transition={{ duration: isDragging ? 0 : 0.2, ease: "easeOut" }}
        />
        {/* 拖拽手柄 */}
        <motion.div
          className="absolute top-1/2 w-5 h-5 bg-base-100 border-2 rounded-full shadow-sm z-10"
          style={{ borderColor: dynamicColor, x: "-50%", y: "-50%" }}
          animate={{ left: `${value}%`, scale: isDragging ? 1.15 : 1 }}
          transition={{ duration: isDragging ? 0 : 0.2, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
