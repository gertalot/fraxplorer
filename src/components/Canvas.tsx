import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import Fractal from "@/fractals/fractal";
import Mandelbrot from "@/fractals/mandelbrot/mandelbrot";

const myFractal = new Mandelbrot();

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
  const fractalRef = useRef<Fractal>(myFractal);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [needsRecompute, setNeedsRecompute] = useState(true);
  const { theme } = useTheme();

  // Initial render, set canvas size to container size
  useEffect(() => {
    if (canvasRef.current) {
      resizeCanvas(canvasRef.current);
      fractalRef.current?.setCanvas(canvasRef.current);
    }
  }, []);

  // Recompute graphics when needed
  useEffect(() => {
    console.log("Checking if needs recompute");
    if (needsRecompute) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      setNeedsRecompute(false);
      requestAnimationFrame(() => {
        fractalRef.current?.render();
      });
    }
  }, [needsRecompute]);

  // handle resizing the window
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleResize = () => {
      const isResized = resizeCanvas(canvas);
      setNeedsRecompute(isResized);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [theme]);

  // Handle dragging
  const startPos = useRef<{ x: number; y: number } | null>(null);

  // Handle dragging
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    startPos.current = { x: e.clientX, y: e.clientY };

    if (canvasRef.current) {
      fractalRef.current?.startMove();
    }

    const handlePointerMove = (e: PointerEvent) => {
      if (startPos.current && canvasRef.current) {
        const dpr = window.devicePixelRatio;
        const dx = (e.clientX - startPos.current.x) * dpr;
        const dy = (e.clientY - startPos.current.y) * dpr;
        fractalRef.current?.move({ x: dx, y: dy });
      }
    };

    const handlePointerUp = () => {
      console.log("Pointer up");
      startPos.current = null;
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
      if (canvasRef.current) {
        fractalRef.current?.stopMove();
      }
      setNeedsRecompute(true);
    };
    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
  };

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      width="100%"
      height="100%"
      className="block h-full w-full"
    />
  );
};
