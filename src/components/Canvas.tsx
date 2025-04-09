import { useRef, useEffect, useState } from "react";

// This ensures the canvas width/height is the same as the container size
function canvasSize(canvas: HTMLCanvasElement | null) {
  if (canvas) {
    const dpr = window.devicePixelRatio;
    const { width, height } = canvas.getBoundingClientRect();
    return { width: width * dpr, height: height * dpr };
  }
  return { width: 0, height: 0 };
}

export const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // keep track of changing dimensions so the canvas can be updated on render
  const [canvasDimensions, setCanvasDimensions] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  // ensure canvas dimensions are updated to match container size when the window resizes
  // (i.e. every pixel on screen is one pixel in the canvas)
  useEffect(() => {
    const updateCanvasSize = () => {
      setCanvasDimensions(canvasSize(canvasRef.current));
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // set canvas size to container pixel size
    const { width, height } = canvasDimensions;
    canvas.width = width;
    canvas.height = height;

    renderCheckerboard();
  }, [canvasDimensions]);

  // Add this new function
  function renderCheckerboard() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Checkerboard pattern parameters
    const tileSize = 32; // pixels per tile
    const colors = ["#0b1220", "#1b2523"]; // darker gray colors

    for (let i = 0; i < canvas.width; i += tileSize) {
      for (let j = 0; j < canvas.height; j += tileSize) {
        ctx.fillStyle = colors[((i + j) / tileSize) % 2 ? 0 : 1];
        ctx.fillRect(i, j, tileSize, tileSize);
      }
    }
  }

  return (
    <canvas
      ref={canvasRef}
      width="100%"
      height="100%"
      className="block h-full w-full"
      style={{ touchAction: "none" }}
    />
  );
};
