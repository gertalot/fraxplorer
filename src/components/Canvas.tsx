import { useEffect, useRef } from "react";
import { useTheme } from "@/components/theme-provider";

export const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const styles = getComputedStyle(canvas);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = styles.getPropertyValue("--secondary");
    ctx.fillRect(0, 0, 100, 100);
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      width="100%"
      height="100%"
      className="block h-full w-full"
    />
  );
};
