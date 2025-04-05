import colorSchemes from "../colorschemes";
import { Fractal, FractalParameters } from "../fractal";

interface RenderChunk {
  startX: number;
  startY: number;
  width: number;
  height: number;
}

class Mandelbrot implements Fractal<FractalParameters> {
  // parameters that define the fractal
  parameters: FractalParameters;

  // data we need for fast previews
  private lastImageData: ImageData | null = null;
  private lastCenter: { x: number; y: number } | null = null;
  private lastZoom: number | null = null;

  constructor() {
    this.parameters = this.defaultParameters();
  }

  defaultParameters(): FractalParameters {
    return {
      maxIterations: 250,
      zoom: 1.0,
      center: { x: -1.0, y: 0 },
      colorScheme: "default",
    };
  }

  preview(canvas: HTMLCanvasElement) {
    console.log("preview", this.parameters.center, this.parameters.zoom);

    this.cancelRendering();

    if (this.lastImageData) {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // keep track of the center of the fractal, for dragging
      if (!this.lastCenter) {
        this.lastCenter = {
          x: this.parameters.center.x,
          y: this.parameters.center.y,
        };
      }

      // Create temporary canvas to hold the image data
      const tmpCanvas = document.createElement("canvas");
      tmpCanvas.width = this.lastImageData.width;
      tmpCanvas.height = this.lastImageData.height;
      const tmpCtx = tmpCanvas.getContext("2d");
      if (!tmpCtx) return;
      tmpCtx.putImageData(this.lastImageData, 0, 0);

      const zoomRatio = this.parameters.zoom / (this.lastZoom || 1);
      const baseScale = canvas.height / this.lastImageData.height;
      const previewScale = baseScale * zoomRatio;

      const renderScale = 4.0 / this.parameters.zoom;

      // offset when canvas is resized; this keeps the center of the last
      // image in the center of the canvas
      const offsetX =
        (canvas.width - this.lastImageData.width * previewScale) / 2;
      const offsetY =
        (canvas.height - this.lastImageData.height * previewScale) / 2;

      // when the user drags the canvas, the center of the fractal changes;
      // calculate the pixel offset for this new center
      const centerOffsetX =
        (this.parameters.center.x - this.lastCenter.x) *
        (canvas.height / renderScale);
      const centerOffsetY =
        (this.parameters.center.y - this.lastCenter.y) *
        (canvas.height / renderScale);

      // Clear the canvas and draw the scaled image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(offsetX - centerOffsetX, offsetY - centerOffsetY);
      ctx.scale(previewScale, previewScale);
      ctx.drawImage(tmpCanvas, 0, 0);
      ctx.restore();
    } else {
      console.log("no preview image data available");
    }
  }

  /**
   * Chunked rendering
   */

  // Rendering state
  private renderingInProgress = false;
  private renderingContext: CanvasRenderingContext2D | null = null;
  private renderingCanvas: HTMLCanvasElement | null = null;
  private renderingProgress = 0;
  private onProgressCallback: ((progress: number) => void) | null = null;
  private onCompleteCallback: (() => void) | null = null;

  //Set a callback to be called when rendering progress updates
  onProgress(callback: (progress: number) => void): void {
    this.onProgressCallback = callback;
  }

  // Set a callback to be called when rendering completes
  onComplete(callback: () => void): void {
    this.onCompleteCallback = callback;
  }

  // Cancel the current rendering process
  cancelRendering(): void {
    this.renderingInProgress = false;
  }

  // Initiate chunked rendering process
  render(canvas: HTMLCanvasElement): void {
    console.log("render", this.parameters, {
      width: canvas.width,
      height: canvas.height,
    });

    // Cancel any ongoing rendering
    this.cancelRendering();

    // Reset preview parameters
    this.lastCenter = null;
    this.lastZoom = null;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Store rendering context for use in the chunked rendering process
    this.renderingContext = ctx;
    this.renderingCanvas = canvas;
    this.renderingInProgress = true;
    this.renderingProgress = 0;

    // Create a new image data for the entire canvas
    const width = canvas.width;
    const height = canvas.height;
    // const imageData = ctx.createImageData(width, height);

    let imageData: ImageData;
    try {
      imageData = ctx.getImageData(0, 0, width, height);
    } catch (_e) {
      imageData = ctx.createImageData(width, height);
    }

    // Create chunks for processing
    const chunks = this.createChunks(width, height);

    // Start the chunked rendering process
    this.processChunks(chunks, 0, imageData);
  }

  private createChunks(width: number, height: number): RenderChunk[] {
    const chunks: RenderChunk[] = [];
    const chunkSize = this.calculateOptimalChunkSize(width, height);

    // Create chunks in a spiral pattern starting from the center
    // This is more user-friendly as the center of the fractal is usually
    // the area of most interest
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);

    // Helper function to add a chunk if any part of it is within canvas bounds
    const addChunkIfValid = (x: number, y: number, w: number, h: number) => {
      // Check if any part of the chunk is within the canvas bounds
      if (x + w > 0 && y + h > 0 && x < width && y < height) {
        // Calculate the visible portion of the chunk
        const startX = Math.max(0, x);
        const startY = Math.max(0, y);
        const endX = Math.min(x + w, width);
        const endY = Math.min(y + h, height);

        // Calculate dimensions of the visible portion
        const visibleWidth = endX - startX;
        const visibleHeight = endY - startY;

        // Only add the chunk if it has a visible area
        if (visibleWidth > 0 && visibleHeight > 0) {
          chunks.push({
            startX,
            startY,
            width: visibleWidth,
            height: visibleHeight,
          });
        }
      }
    };

    // Start with a center chunk
    addChunkIfValid(
      centerX - chunkSize / 2,
      centerY - chunkSize / 2,
      chunkSize,
      chunkSize,
    );

    // Add chunks in expanding spiral
    let layer = 1;
    while (layer * chunkSize < Math.max(width, height)) {
      // Top row of this layer
      for (
        let x = centerX - layer * chunkSize;
        x < centerX + layer * chunkSize;
        x += chunkSize
      ) {
        addChunkIfValid(x, centerY - layer * chunkSize, chunkSize, chunkSize);
      }

      // Right column of this layer
      for (
        let y = centerY - layer * chunkSize + chunkSize;
        y < centerY + layer * chunkSize;
        y += chunkSize
      ) {
        addChunkIfValid(
          centerX + layer * chunkSize - chunkSize,
          y,
          chunkSize,
          chunkSize,
        );
      }

      // Bottom row of this layer
      for (
        let x = centerX + layer * chunkSize - 2 * chunkSize;
        x >= centerX - layer * chunkSize;
        x -= chunkSize
      ) {
        addChunkIfValid(
          x,
          centerY + layer * chunkSize - chunkSize,
          chunkSize,
          chunkSize,
        );
      }

      // Left column of this layer
      for (
        let y = centerY + layer * chunkSize - 2 * chunkSize;
        y > centerY - layer * chunkSize;
        y -= chunkSize
      ) {
        addChunkIfValid(centerX - layer * chunkSize, y, chunkSize, chunkSize);
      }

      layer++;
    }

    return chunks;
  }

  private calculateOptimalChunkSize(width: number, height: number): number {
    // Base chunk size on canvas dimensions
    // Aim for around 50-100 chunks total for a typical canvas
    const totalPixels = width * height;
    const targetChunkPixels = totalPixels / 50; // Aim for ~75 chunks

    // Get a square chunk size
    let chunkSize = Math.floor(Math.sqrt(targetChunkPixels));

    // Ensure chunk size is at least 20px and at most 100px
    chunkSize = Math.max(20, Math.min(500, chunkSize));

    return chunkSize;
  }

  private processChunks(
    chunks: RenderChunk[],
    index: number,
    imageData: ImageData,
  ): void {
    // Check if we should continue rendering
    if (
      !this.renderingInProgress ||
      !this.renderingContext ||
      !this.renderingCanvas
    ) {
      this.lastImageData = imageData;
      this.lastZoom = this.parameters.zoom;

      return;
    }

    // Check if we've processed all chunks
    if (index >= chunks.length) {
      // Rendering is complete
      this.renderingInProgress = false;
      this.lastImageData = imageData;
      this.lastZoom = this.parameters.zoom;

      // Call the complete callback if provided
      if (this.onCompleteCallback) {
        this.onCompleteCallback();
      }
      return;
    }

    // Process the current chunk
    const chunk = chunks[index];
    this.renderChunk(chunk, imageData);

    // Update the canvas with our progress so far
    this.renderingContext.putImageData(imageData, 0, 0);

    // Update progress
    this.renderingProgress = (index + 1) / chunks.length;
    if (this.onProgressCallback) {
      this.onProgressCallback(this.renderingProgress);
    }

    // Schedule the next chunk
    requestAnimationFrame(() => {
      this.processChunks(chunks, index + 1, imageData);
    });
  }

  private renderChunk(chunk: RenderChunk, imageData: ImageData): void {
    if (!this.renderingCanvas) return;

    const { startX, startY, width, height } = chunk;
    const canvasWidth = this.renderingCanvas.width;
    const canvasHeight = this.renderingCanvas.height;
    const data = imageData.data;

    const selectedColorScheme =
      this.parameters.colorScheme || Object.keys(colorSchemes)[0];
    const getColor = colorSchemes[selectedColorScheme];

    const scale = 4.0 / this.parameters.zoom;

    // Process each pixel in the chunk
    for (let x = startX; x < startX + width; x++) {
      for (let y = startY; y < startY + height; y++) {
        // Convert pixel coordinate to complex number
        const real =
          this.parameters.center.x +
          ((x - canvasWidth / 2) * scale) / canvasHeight;
        const imag =
          this.parameters.center.y +
          ((y - canvasHeight / 2) * scale) / canvasHeight;

        // Calculate Mandelbrot set iteration count
        let zr = 0;
        let zi = 0;
        let iter = 0;

        while (zr * zr + zi * zi < 4 && iter < this.parameters.maxIterations) {
          const newZr = zr * zr - zi * zi + real;
          zi = 2 * zr * zi + imag;
          zr = newZr;
          iter++;
        }

        // Compute color based on number of iterations
        const [r, g, b] = getColor(iter, this.parameters.maxIterations);
        const pixelIndex = (y * canvasWidth + x) * 4;

        data[pixelIndex] = r;
        data[pixelIndex + 1] = g;
        data[pixelIndex + 2] = b;
        data[pixelIndex + 3] = 255;
      }
    }
  }
}

export default Mandelbrot;
