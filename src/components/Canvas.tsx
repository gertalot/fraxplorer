"use client";

import { usePanZoom } from "@/hooks/use-pan-zoom";
import { useRef, useEffect, useState, useCallback } from "react";

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

  /**************************************************************************
   * handle the browser window resizing
   **************************************************************************/

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

  // re-render canvas when canvas dimensions change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // set canvas size to container pixel size
    const { width, height } = canvasDimensions;
    canvas.width = width;
    canvas.height = height;

    if (width > 0 && height > 0) {
      render();
    }
  }, [canvasDimensions]);

  /**************************************************************************
   * Track panning and zooming actions from the user; preview immediately,
   * but defer full render until user is idle for one second.
   **************************************************************************/

  // Add wheelDeltaRef alongside dragOffsetRef
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const wheelDeltaRef = useRef({ x: 0, y: 0 });
  const pointerPositionRef = useRef({ x: 0, y: 0 });

  // Handle user activity and trigger preview/render
  const handleUserActivity = useCallback(() => {
    // Clear any existing timer
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    // Preview immediately for responsive feedback
    preview();

    // Set a new timer for the full render
    idleTimerRef.current = setTimeout(() => {
      // reset the pan/zoom interaction state
      resetInteractionState();
      render();
    }, 1000);
  }, []); // No dependencies needed now

  const { dragOffset, wheelDelta, pointerPosition, resetInteractionState } = usePanZoom(canvasRef, handleUserActivity);

  // Update the refs whenever values change
  useEffect(() => {
    dragOffsetRef.current = dragOffset;
  }, [dragOffset]);

  useEffect(() => {
    wheelDeltaRef.current = wheelDelta;
  }, [wheelDelta]);

  useEffect(() => {
    pointerPositionRef.current = pointerPosition;
  }, [pointerPosition]);

  const imageDataRef = useRef<ImageData | null>(null);

  function preview() {
    console.log("previewing...");
    const currentImageData = imageDataRef.current;
    if (currentImageData) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Clear the canvas first
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create a temporary canvas for manipulation
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) return;

      // Set temp canvas to same size as our main canvas
      tempCanvas.width = currentImageData.width;
      tempCanvas.height = currentImageData.height;

      // Put the image data on the temp canvas
      tempCtx.putImageData(currentImageData, 0, 0);

      // Calculate scale factor based on wheelDelta
      // A smaller divisor makes zooming more sensitive
      const scaleFactor = Math.max(1, 1 + wheelDeltaRef.current.y / 1000);
      console.log("scaleFactor:", scaleFactor, "wheelDelta:", wheelDeltaRef.current.y);

      // Save the current transformation state
      ctx.save();

      // Apply transformations (scale and translate)
      // First translate to the pointer position (center of zoom)
      ctx.translate(pointerPositionRef.current.x, pointerPositionRef.current.y);

      // Apply scaling
      ctx.scale(scaleFactor, scaleFactor);

      // Translate back and apply the drag offset
      ctx.translate(
        -pointerPositionRef.current.x + dragOffsetRef.current.x,
        -pointerPositionRef.current.y + dragOffsetRef.current.y
      );

      // Draw the temp canvas onto the main canvas with transformations applied
      ctx.drawImage(tempCanvas, 0, 0);

      // Restore the original transformation state
      ctx.restore();
    } else {
      console.log("no preview image data available; re-rendering");
      render();
    }
  }

  function render() {
    console.log("rendering...");
    renderCheckerboard();
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (canvas.width === 0 || canvas.height === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Store in both ref (for immediate access) and state (for reactivity)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    imageDataRef.current = imageData;
    console.log("rendering done.");
  }

  // Add this new function
  function renderCheckerboard() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Checkerboard pattern parameters
    const tileSize = 64; // pixels per tile
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
