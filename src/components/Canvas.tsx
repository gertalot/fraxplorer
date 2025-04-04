"use client";
import { useEffect, useRef, useState } from "react";
import { FractalParameters, Fractal } from "../fractals/fractal";

const RERENDER_TIMEOUT_MS = 1000;

function canvasSize(canvas: HTMLCanvasElement | null) {
  if (canvas) {
    const dpr = window.devicePixelRatio;
    const { width, height } = canvas.getBoundingClientRect();
    return { width: width * dpr, height: height * dpr };
  }
  return { width: 0, height: 0 };
}

interface CanvasProps {
  fractal: Fractal<FractalParameters>;
}

export const Canvas = ({ fractal }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasDimensions, setCanvasDimensions] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });
  const [params, setParams] = useState<FractalParameters>(fractal.parameters);

  /**
   * On Initial render, set canvas dimensions to container size
   */
  useEffect(() => {
    const updateCanvasSize = () => {
      setCanvasDimensions(canvasSize(canvasRef.current));
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  /**
   * Update canvas size and fractal parameters, and trigger a re-render
   * with debouncing
   */

  // timeout to debounce events before (expensive) re-rendering
  const renderTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Update canvas when parameters or canvas size change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // set canvas size to container pixel size
    const { width, height } = canvasDimensions;
    canvas.width = width;
    canvas.height = height;

    // set fractal parameters
    fractal.parameters = { ...params };

    // immediately render fractal preview
    if (canvas.width === 0 || canvas.height === 0) {
      console.log("Canvas size is 0, not rendering");
    } else {
      fractal.preview(canvas);
    }

    // debounce mechanism: ensure some time has passed before re-rendering
    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current);
    }
    renderTimeoutRef.current = setTimeout(() => {
      fractal.render(canvas);
    }, RERENDER_TIMEOUT_MS);
    return () => {
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
    };
  }, [fractal, params, canvasDimensions]);

  /**
   * Handle user interactions
   */

  const [isDragging, setIsDragging] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setLastPosition({ x: event.clientX, y: event.clientY });
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    const delta = {
      x: event.clientX - lastPosition.x,
      y: event.clientY - lastPosition.y,
    };
    // Calculate new center based on drag distance and zoom level
    const newCenter = {
      x:
        params.center.x -
        (delta.x / canvasDimensions.width) * (2 / params.zoom),
      y:
        params.center.y +
        (delta.y / canvasDimensions.height) * (2 / params.zoom),
    };

    setParams((prev) => ({
      ...prev,
      center: newCenter,
    }));
    setLastPosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handleMouseUp}
      onPointerLeave={handleMouseUp}
      width="100%"
      height="100%"
      className="block h-full w-full"
    />
  );
};
