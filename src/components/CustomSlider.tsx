import { useRef, useEffect, useState } from "react";
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
    onChange(Math.max(1, percentage)); // 最小为 1
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

  // 根据重要性（0-100）计算颜色深度（越红越深）
  const dynamicColor = `hsl(348, ${50 + value / 2}%, ${80 - value / 2.5}%)`;

  return (
    <div className="py-4">
      <div className="flex justify-between text-xs text-base-content/50 mb-2 font-medium">
        <span>普通</span>
        <span style={{ color: dynamicColor }} className="font-bold">
          {value}
        </span>
        <span>极其紧急</span>
      </div>
      <div
        ref={trackRef}
        className="h-3 bg-base-300 rounded-full relative cursor-pointer touch-none shadow-inner"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* 填充条 */}
        <motion.div
          className="absolute top-0 left-0 h-full rounded-full"
          style={{ backgroundColor: dynamicColor }}
          animate={{ width: `${value}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
        {/* 拖拽手柄 */}
        <motion.div
          className="absolute top-1/2 w-6 h-6 bg-base-100 border-2 rounded-full shadow-md z-10"
          style={{ borderColor: dynamicColor, x: "-50%", y: "-50%" }}
          animate={{ left: `${value}%`, scale: isDragging ? 1.2 : 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        />
      </div>
    </div>
  );
}
