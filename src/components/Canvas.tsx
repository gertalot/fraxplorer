"use client";

import { usePanZoom } from "@/hooks/use-pan-zoom";
import { useFractalStore } from "@/hooks/use-store";
import { pixelToFractalCoordinate } from "@/lib/coordinates";
import { useRef, useEffect, useState, RefObject } from "react";

// This ensures the canvas width/height is the same as the container size
function canvasSize(canvas: HTMLCanvasElement | null) {
  if (canvas) {
    const dpr = window.devicePixelRatio || 1;
    const { width, height } = canvas.getBoundingClientRect();
    return { width: width * dpr, height: height * dpr };
  }
  return { width: 0, height: 0 };
}

/**************************************************************************
 * Handle the user dragging and zooming and update the fractal params
 **************************************************************************/

function usePanZoomToUpdateParams(canvasRef: RefObject<HTMLCanvasElement | null>) {
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const zoomRef = useRef<number | null>(null);
  const { params, setParams } = useFractalStore();
  const fractalCenterRef = useRef<{ x: number; y: number } | null>(null);
  const fractalZoomRef = useRef<number | null>(null);

  const { isDragging, isZooming, dragOffset, wheelDelta } = usePanZoom(canvasRef, {
    onDragStart: () => {
      dragRef.current = { x: 0, y: 0 };
      fractalCenterRef.current = params.center;
      fractalZoomRef.current = params.zoom;
    },
    onDragEnd: () => {
      dragRef.current = null;
      fractalCenterRef.current = null;
    },
    onWheelStart: () => {
      zoomRef.current = 0;
      fractalCenterRef.current = params.center;
      fractalZoomRef.current = params.zoom;
    },
    onWheelEnd: () => {
      zoomRef.current = null;
      fractalZoomRef.current = null;
    },
  });

  useEffect(() => {
    if (!canvasRef.current) return;
    if (isDragging || isZooming) {
      // convert the drag vector to a new fractal center coordinate
      const { width: canvasWidth, height: canvasHeight } = canvasSize(canvasRef.current);
      const newCanvasCenter = {
        x: canvasWidth / 2 - dragOffset.x,
        y: canvasHeight / 2 - dragOffset.y,
      };

      const newFractalCenter = pixelToFractalCoordinate(
        newCanvasCenter,
        canvasWidth,
        canvasHeight,
        fractalCenterRef.current || params.center,
        fractalZoomRef.current || params.zoom
      );

      const zoomFactor = Math.exp(wheelDelta * 0.01);
      const newFractalZoom = fractalZoomRef.current! * zoomFactor;
      const clampedZoom = Math.max(1, newFractalZoom);

      setParams({
        ...params,
        zoom: clampedZoom,
        center: {
          x: newFractalCenter.x,
          y: newFractalCenter.y,
        },
      });
    }
  }, [isDragging, isZooming, dragOffset, wheelDelta]);
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
    const updateCanvasDimensions = () => {
      setCanvasDimensions(canvasSize(canvasRef.current));
    };

    updateCanvasDimensions();
    window.addEventListener("resize", updateCanvasDimensions);
    return () => window.removeEventListener("resize", updateCanvasDimensions);
  }, []);

  // update preview when canvas dimensions change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // set canvas size to container pixel size
    const { width, height } = canvasDimensions;
    canvas.width = width;
    canvas.height = height;
  }, [canvasDimensions]);

  // handle panning and zooming to update the fractal params
  usePanZoomToUpdateParams(canvasRef);

  /**************************************************************************
   * Fast preview of panning, zooming, and canvas resizing by using the
   * existing canvas image data if available.
   **************************************************************************/
  const imageDataRef = useRef<ImageData | null>(null);

  /**************************************************************************
   * Render the fractal preview on the canvas
   **************************************************************************/

  // function preview() {
  //   console.log("previewing...");
  //   const currentImageData = imageDataRef.current;
  //   if (currentImageData) {
  //     const canvas = canvasRef.current;
  //     if (!canvas) return;
  //     const ctx = canvas.getContext("2d");
  //     if (!ctx) return;

  //     const { width: currentWidth, height: currentHeight } = canvasSize(canvas);
  //     const previousWidth = currentImageData.width;
  //     const previousHeight = currentImageData.height;

  //     // Calculate size delta between current and previous canvas
  //     const widthDelta = currentWidth - previousWidth;
  //     const heightDelta = currentHeight - previousHeight;

  //     const centerX = currentWidth / 2;
  //     const centerY = currentHeight / 2;

  //     // Clear the canvas first
  //     ctx.clearRect(0, 0, currentWidth, currentHeight);

  //     // Create a temporary canvas for manipulation
  //     const tempCanvas = document.createElement("canvas");
  //     tempCanvas.width = previousWidth;
  //     tempCanvas.height = previousHeight;
  //     tempCanvas.getContext("2d")?.putImageData(currentImageData, 0, 0);

  //     const resizeOffset = {
  //       x: widthDelta / 2, // Center offset X
  //       y: heightDelta / 2, // Center offset Y
  //     };

  //     // Calculate scale factor based on wheelDelta
  //     // A smaller divisor makes zooming more sensitive
  //     let scaleFactor = 1 + wheelDeltaRef.current.y / 1000;

  //     if (scaleFactor < 1) {
  //       // Limit minimum scale factor, also reset wheelDelta in that case
  //       scaleFactor = 1;
  //       setInteractionState((prev) => ({
  //         ...prev,
  //         wheelDelta: { x: prev.wheelDelta.x, y: 0 },
  //       }));
  //     }

  //     // Save the current transformation state
  //     ctx.save();

  //     ctx.translate(resizeOffset.x + dragOffsetRef.current.x, resizeOffset.y + dragOffsetRef.current.y);

  //     // Then scale from the tracked center
  //     ctx.translate(centerX, centerY);
  //     ctx.scale(scaleFactor, scaleFactor);
  //     ctx.translate(-centerX, -centerY);

  //     // Draw the temp canvas onto the main canvas with transformations applied
  //     ctx.drawImage(tempCanvas, 0, 0);

  //     // Restore the original transformation state
  //     ctx.restore();
  //   } else {
  //     console.log("no preview image data available.");
  //   }
  // }

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

  /**************************************************************************
   * Track updates to canvas dimensions and parameters, and after an idle
   * period, update the fractal parameters and re-render.
   **************************************************************************/

  const userActivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (canvas.width > 0 || canvas.height > 0) {
      // preview();
    }

    if (userActivityTimerRef.current) {
      clearTimeout(userActivityTimerRef.current);
    }
    userActivityTimerRef.current = setTimeout(() => {
      render();
    }, 1000);
  }, [canvasDimensions]);

  function renderCheckerboard() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Checkerboard pattern parameters
    const tileSize = 64; // pixels per tile
    const colors = ["#0b1220", "#1b2523"]; // darker gray colors

    // draw the tiles
    for (let i = 0; i < canvas.width; i += tileSize) {
      for (let j = 0; j < canvas.height; j += tileSize) {
        ctx.fillStyle = colors[((i + j) / tileSize) % 2 ? 0 : 1];
        ctx.fillRect(i, j, tileSize, tileSize);
      }
    }

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.height * 0.3; // 30% of canvas height

    // Draw circle with red outline
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw horizontal line
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvas.width, centerY);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw vertical line
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, canvas.height);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 1;
    ctx.stroke();
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
