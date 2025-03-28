import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import Fractal from "@/fractals/fractal";
import mandelbrot from "@/fractals/mandelbrot/mandelbrot";

function resizeCanvas(canvas: HTMLCanvasElement) {
  // Lookup the size the browser is displaying the canvas in CSS pixels.
  const dpr = window.devicePixelRatio;
  const { width, height } = canvas.getBoundingClientRect();
  const displayWidth = Math.round(width * dpr);
  const displayHeight = Math.round(height * dpr);

  // Check if the canvas is not the same size.
  const needResize =
    canvas.width !== displayWidth || canvas.height !== displayHeight;

  if (needResize) {
    // Make the canvas the same size
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }

  return needResize;
}

export const Canvas = () => {
  const fractal: Fractal = mandelbrot;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [needsRecompute, setNeedsRecompute] = useState(true);
  const { theme } = useTheme();

  // Initial render, set canvas size to container size
  useEffect(() => {
    if (canvasRef.current) {
      resizeCanvas(canvasRef.current);
    }
  }, []);

  // Recompute graphics when needed
  useEffect(() => {
    if (needsRecompute) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      setNeedsRecompute(false);
      fractal.render(canvas);
    }
  }, [needsRecompute]);

  // set up event listeners for user interaction
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Add resize handler
    const handleResize = () => {
      const isResized = resizeCanvas(canvas);
      setNeedsRecompute(isResized);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
