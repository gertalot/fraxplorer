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
  colorScheme: string | null;
}

/**
 * A React component that renders a fractal visualization on an HTML canvas.
 * Handles user interactions like dragging to pan the view and supports dynamic resizing.
 * The component props expect a Fractal object for previewing and rendering.
 *
 * @param {Object} props - Component props
 * @param {Fractal<FractalParameters>} props.fractal - The fractal object to render
 * @returns {JSX.Element} A canvas element that displays the fractal
 */
export const Canvas = ({ fractal, colorScheme }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // keep track of changing dimensions so the canvas can be updated on render
  const [canvasDimensions, setCanvasDimensions] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });
  // keep track of changing fractal parameters
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
   * Update when color scheme changes
   */
  useEffect(() => {
    console.log("Updating color scheme", colorScheme);
    // Update fractal parameters when color scheme changes
    setParams((prev) => ({ ...prev, colorScheme: colorScheme }));
    fractal.parameters.colorScheme = colorScheme;
  }, [colorScheme]);

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

    // const newMaxIterations = Math.floor(250 + 1000 * Math.log10(newZoom + 1));
    // console.log("New max iterations", newMaxIterations);

    // setParams((prev) => ({
    //   ...prev,
    //   zoom: newZoom,
    //   maxIterations: newMaxIterations,
    // }));

    // set fractal parameters
    fractal.parameters = {
      ...params,
      maxIterations: Math.floor(250 + 1000 * Math.log10(params.zoom + 1)),
    };

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
  const [lastDragPosition, setLastDragPosition] = useState({ x: 0, y: 0 });

  // Handle dragging
  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setLastDragPosition({ x: event.clientX, y: event.clientY });
  };

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

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();

    // Calculate zoom factor based on wheel delta
    const zoomFactor = event.deltaY < 0 ? 1.05 : 0.95;
    const newZoom = Math.max(params.zoom * zoomFactor, 1);

    // const newMaxIterations = Math.floor(250 + 1000 * Math.log10(newZoom + 1));
    // console.log("New max iterations", newMaxIterations);

    setParams((prev) => ({
      ...prev,
      zoom: newZoom,
      // maxIterations: newMaxIterations,
    }));
  };

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handleMouseUp}
      onPointerLeave={handleMouseUp}
      onWheel={handleWheel}
      width="100%"
      height="100%"
      className="block h-full w-full"
      style={{ touchAction: "none" }}
    />
  );
};
