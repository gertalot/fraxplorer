"use client";

import { FractalParameters } from "@/fractals/fractal";
import type React from "react";
import { useState } from "react";

/**
 * Custom hook to handle fractal interaction logic (panning and zooming)
 *
 * @param initialParams Initial fractal parameters
 * @param canvasDimensions Current canvas canvasDimensions
 * @param canvasRef Ref to the canvas element
 * @returns Object containing updated parameters and event handlers
 */
export function useCanvasPanZoom(
  initialParams: FractalParameters,
  canvasDimensions: { width: number; height: number }
) {
  const [params, setParams] = useState<FractalParameters>(initialParams);
  const [isDragging, setIsDragging] = useState(false);
  const [lastDragPosition, setLastDragPosition] = useState({ x: 0, y: 0 });

  // Handle the start of a drag/pan operation
  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setLastDragPosition({ x: event.clientX, y: event.clientY });
  };

  // move the fractal center when the user is dragging
  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    const dpr = window.devicePixelRatio;
    const delta = {
      x: (event.clientX - lastDragPosition.x) * dpr,
      y: (event.clientY - lastDragPosition.y) * dpr,
    };

    // Calculate new center based on drag distance and zoom level
    const scale = 4.0 / params.zoom;
    const newCenter = {
      x: params.center.x - (delta.x * scale) / canvasDimensions.height,
      y: params.center.y - (delta.y * scale) / canvasDimensions.height,
    };

    setParams((prev) => ({
      ...prev,
      center: newCenter,
    }));
    setLastDragPosition({ x: event.clientX, y: event.clientY });
  };

  // we're done panning
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle zooming in and out
  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();

    // Calculate zoom factor based on wheel delta
    const zoomFactor = event.deltaY < 0 ? 1.05 : 0.95;
    const newZoom = Math.max(params.zoom * zoomFactor, 1);

    setParams((prev) => ({
      ...prev,
      zoom: newZoom,
    }));
  };

  return {
    params,
    setParams,
    eventHandlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handleMouseUp,
      onPointerLeave: handleMouseUp,
      onWheel: handleWheel,
    },
  };
}
