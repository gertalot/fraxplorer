"use client";
import { useEffect, useRef, useState } from "react";
import { FractalParameters, Fractal } from "../fractals/fractal";
import { useCanvasPanZoom } from "./hooks/use-canvas-pan-zoom";

// The fractal re-renders fully after this number of milliseconds of inactivity
// This gives the user a chance to drag and zoom the fractal with the fast preview
// code, without triggering slow full renders all the time.
const RERENDER_TIMEOUT_MS = 1000;

// This ensures the canvas width/height is the same as the container size
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

  // all user interaction is handled in this custom hook
  const { params, eventHandlers } = useCanvasPanZoom(fractal.parameters, canvasDimensions);

  // On Initial render, set canvas dimensions to container size
  useEffect(() => {
    const updateCanvasSize = () => {
      setCanvasDimensions(canvasSize(canvasRef.current));
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  // Update when color scheme changes
  useEffect(() => {
    console.log("Updating color scheme", colorScheme);
    fractal.applyColorScheme(colorScheme, canvasRef.current);
  }, [colorScheme]);

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

    // set fractal parameters. Also make the max iterations depend on zoom level.
    // That means the more you zoom in, the higher the max iterations are.
    fractal.parameters = {
      ...params,
      maxIterations: Math.floor(250 + 1000 * Math.log10(params.zoom + 1)),
    };

    // immediately render fractal preview (the condition exists because when the
    // components are first rendered the canvas size is 0 somehow)
    if (canvas.width > 0 && canvas.height > 0) {
      fractal.preview(canvas);
    }

    // debounce mechanism: ensure some time has passed before re-rendering
    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current);
    }
    renderTimeoutRef.current = setTimeout(() => {
      // trigger a full render of the fractal after inactivity
      fractal.render(canvas);
    }, RERENDER_TIMEOUT_MS);
    return () => {
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
    };
  }, [fractal, params, canvasDimensions]);

  return (
    <canvas
      ref={canvasRef}
      {...eventHandlers}
      width="100%"
      height="100%"
      className="block h-full w-full"
      style={{ touchAction: "none" }}
    />
  );
};
