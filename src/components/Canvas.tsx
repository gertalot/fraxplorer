import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import Mandelbrot from "@/fractals/mandelbrot/mandelbrot";
import useDrag from "./hooks/useDrag";
import useZoom from "./hooks/useZoom";
import { useDebounce } from "./hooks/useDebounce";

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
  const fractalRef = useRef<Mandelbrot>(myFractal);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // const { theme } = useTheme();

  // Initial render, set canvas size to container size
  useEffect(() => {
    if (canvasRef.current) {
      resizeCanvas(canvasRef.current);
      fractalRef.current?.setCanvas(canvasRef.current);
      fractalRef.current?.render();
    }
  }, []);

  const handleResize = () => {
    if (canvasRef.current) {
      const didResize = resizeCanvas(canvasRef.current);
      if (didResize) {
        fractalRef.current?.render();
      }
    }
  };

  // handle resizing the window
  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // useEffect(() => {
  //   const canvas = canvasRef.current;
  //   if (!canvas) return;
  //   const handleResize = () => {
  //     const isResized = resizeCanvas(canvas);
  //     if (isResized) {
  //       fractalRef.current?.render();
  //     }
  //   };

  //   window.addEventListener("resize", handleResize);
  //   return () => window.removeEventListener("resize", handleResize);
  // }, []);

  // Add drag hook
  const handlePointerDown = useDrag(({ x, y }, z) => {
    fractalRef.current?.transform({ x, y }, z);
  });

  const [handleWheel, handleTouchStart] = useZoom((center, delta) => {
    fractalRef.current?.transform(center, delta);
  });

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      // onTouchStart={handleTouchStart}
      onWheel={handleWheel}
      width="100%"
      height="100%"
      className="block h-full w-full"
    />
  );
};
