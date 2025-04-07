import { WorkerPool } from "@/lib/workerpool";
import { Fractal, FractalParameters } from "../fractal";
import colorSchemes from "../colorschemes";
import { ColorSchemeFn } from "../colorschemes";

interface RenderChunk {
  startX: number;
  startY: number;
  width: number;
  height: number;
}

// Define message types for worker communication
interface RenderChunkMessage {
  type: "renderChunk";
  chunk: RenderChunk;
  parameters: FractalParameters;
  canvasWidth: number;
  canvasHeight: number;
  chunkIndex: number;
}

interface ChunkCompleteMessage {
  type: "chunkComplete";
  buffer: Uint32Array;
  chunk: RenderChunk;
  chunkIndex: number;
}

// type WorkerMessage = RenderChunkMessage | InitMessage
type WorkerResponse = ChunkCompleteMessage;

class Mandelbrot implements Fractal<FractalParameters> {
  // parameters that define the fractal
  parameters: FractalParameters;
  colorScheme: string | null;

  // data we need for fast previews
  private lastImageData: ImageData | null = null;
  private lastCenter: { x: number; y: number } | null = null;
  private lastZoom: number | null = null;

  // Rendering state
  private renderingInProgress = false;
  private renderingContext: CanvasRenderingContext2D | null = null;
  private renderingCanvas: HTMLCanvasElement | null = null;
  private renderingProgress = 0;
  private onProgressCallback: ((progress: number) => void) | null = null;
  private onCompleteCallback: (() => void) | null = null;
  private chunksTotal = 0;
  private chunksCompleted = 0;

  // Worker pool for parallel rendering
  private workerPool: WorkerPool | null = null;
  private workerInitialized = false;

  // Store iteration data for the entire canvas
  private fullCanvasIterationData: Uint32Array | null = null;
  private canvasWidth = 0;
  private canvasHeight = 0;

  constructor() {
    this.parameters = this.defaultParameters();
    this.colorScheme = Object.keys(colorSchemes)[0];
    this.initWorkerPool();
  }

  // Initialize the worker pool
  private async initWorkerPool(): Promise<void> {
    if (this.workerPool) return;

    // Create the worker pool
    this.workerPool = new WorkerPool({
      workerScript: new URL("./worker.ts", import.meta.url).href,
      // maxWorkers: 1,
      onError: (error) => {
        console.error("Worker error:", error);
      },
    });

    // Wait for workers to initialize
    await this.workerPool.waitForInit();

    this.workerInitialized = true;
    console.log(
      `Initialized ${this.workerPool.getWorkerCount()} worker${this.workerPool.getWorkerCount() === 1 ? "" : "s"}`
    );
  }

  defaultParameters(): FractalParameters {
    return {
      maxIterations: 250,
      zoom: 1.0,
      center: { x: -1.0, y: 0 },
      // colorScheme: "default",
    };
  }

  preview(canvas: HTMLCanvasElement) {
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
      const offsetX = (canvas.width - this.lastImageData.width * previewScale) / 2;
      const offsetY = (canvas.height - this.lastImageData.height * previewScale) / 2;

      // when the user drags the canvas, the center of the fractal changes;
      // calculate the pixel offset for this new center
      const centerOffsetX = (this.parameters.center.x - this.lastCenter.x) * (canvas.height / renderScale);
      const centerOffsetY = (this.parameters.center.y - this.lastCenter.y) * (canvas.height / renderScale);

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
    if (this.onProgressCallback) {
      this.onProgressCallback(0);
    }
  }

  async render(canvas: HTMLCanvasElement): Promise<void> {
    console.log("render", this.parameters, {
      width: canvas.width,
      height: canvas.height,
    });

    let getColorFn;
    if (this.colorScheme && colorSchemes[this.colorScheme]) {
      getColorFn = colorSchemes[this.colorScheme];
    } else {
      getColorFn = colorSchemes[Object.keys(colorSchemes)[0]];
    }

    // Make sure workers are initialized
    if (!this.workerInitialized) {
      await this.initWorkerPool();
    }

    // Cancel any ongoing rendering
    this.cancelRendering();

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Store rendering context for use in the rendering process
    this.renderingContext = ctx;
    this.renderingCanvas = canvas;
    this.renderingInProgress = true;
    this.renderingProgress = 0;
    this.chunksCompleted = 0;

    // Store canvas dimensions
    this.canvasWidth = canvas.width;
    this.canvasHeight = canvas.height;

    // Initialize the full canvas iteration data array
    this.fullCanvasIterationData = new Uint32Array(canvas.width * canvas.height);

    // Create chunks for processing
    const chunks = this.createChunks(canvas.width, canvas.height);
    this.chunksTotal = chunks.length;

    console.log(`Rendering ${chunks.length} chunks`);

    // Store the current center and zoom for future previews
    this.lastCenter = {
      x: this.parameters.center.x,
      y: this.parameters.center.y,
    };
    this.lastZoom = this.parameters.zoom;

    // Process chunks using web workers
    await this.processChunksWithWorkers(chunks, getColorFn);
  }

  // Process chunks using web workers
  private async processChunksWithWorkers(chunks: RenderChunk[], getColorFn: ColorSchemeFn): Promise<void> {
    if (!this.workerPool || !this.renderingCanvas || !this.renderingContext) {
      console.error("No worker pool. canvas, or rendering context");
      return;
    }

    // Create a promise that resolves when all chunks are processed
    const renderPromise = new Promise<void>((resolve) => {
      // Create an array to track which chunks have been processed
      const processedChunks = new Array(chunks.length).fill(false);

      // Process each chunk in parallel
      chunks.forEach((chunk, index) => {
        // Skip if rendering was cancelled
        if (!this.renderingInProgress) {
          return;
        }

        // Send the chunk to a worker
        this.workerPool!.execute<RenderChunkMessage, WorkerResponse>({
          type: "renderChunk",
          chunk,
          parameters: this.parameters,
          canvasWidth: this.renderingCanvas!.width,
          canvasHeight: this.renderingCanvas!.height,
          chunkIndex: index,
        })
          .then((result) => {
            // Skip if rendering was cancelled
            if (!this.renderingInProgress) {
              return;
            }

            // console.log("Chunk result:", result);

            // Get the chunk data from the result
            const { buffer, chunk: renderedChunk, chunkIndex } = result;

            // Store the iteration data in the full canvas array
            this.storeChunkIterationData(buffer, renderedChunk);

            // Convert the iteration data to RGBA data we can use on the canvas
            const iterationData = buffer;
            const rgbaData = new Uint8ClampedArray(iterationData.length * 4);

            for (let i = 0; i < iterationData.length; i++) {
              const [r, g, b] = getColorFn(iterationData[i], this.parameters.maxIterations);
              const pixelIndex = i * 4;
              rgbaData[pixelIndex] = r;
              rgbaData[pixelIndex + 1] = g;
              rgbaData[pixelIndex + 2] = b;
              rgbaData[pixelIndex + 3] = 255;
            }

            // Create a new ImageData from the buffer
            const chunkImageData = new ImageData(rgbaData, renderedChunk.width, renderedChunk.height);

            // Put the chunk data into the main image data
            this.renderingContext!.putImageData(chunkImageData, renderedChunk.startX, renderedChunk.startY);

            // just messing around - trying to set the lastImageData after every completed chunk
            this.lastImageData = this.renderingContext!.getImageData(
              0,
              0,
              this.renderingCanvas!.width,
              this.renderingCanvas!.height
            );

            // Mark the chunk as processed
            processedChunks[chunkIndex] = true;
            this.chunksCompleted++;

            // Update progress
            this.renderingProgress = this.chunksCompleted / this.chunksTotal;
            if (this.onProgressCallback) {
              this.onProgressCallback(this.renderingProgress);
            }

            // Check if all chunks are processed
            if (processedChunks.every((processed) => processed)) {
              // Save the completed image data
              this.lastImageData = this.renderingContext!.getImageData(
                0,
                0,
                this.renderingCanvas!.width,
                this.renderingCanvas!.height
              );

              // Mark rendering as complete
              this.renderingInProgress = false;

              // Call the complete callback
              if (this.onCompleteCallback) {
                this.onCompleteCallback();
              }

              // Resolve the promise
              resolve();
            }
          })
          .catch((error) => {
            console.error("Error rendering chunk:", error);

            // Mark the chunk as processed even if it failed
            processedChunks[index] = true;
            this.chunksCompleted++;

            // Check if all chunks are processed
            if (processedChunks.every((processed) => processed)) {
              resolve();
            }
          });
      });
    });

    // Wait for all chunks to be processed
    await renderPromise;
  }

  /**
   * Store a chunk's iteration data in the full canvas array
   */
  private storeChunkIterationData(chunkData: Uint32Array, chunk: RenderChunk): void {
    if (!this.fullCanvasIterationData) return;

    const { startX, startY, width, height } = chunk;

    // Copy each row of the chunk data to the correct position in the full canvas array
    for (let y = 0; y < height; y++) {
      const canvasRowOffset = (startY + y) * this.canvasWidth + startX;
      const chunkRowOffset = y * width;

      // Copy this row from chunk data to full canvas data
      for (let x = 0; x < width; x++) {
        this.fullCanvasIterationData[canvasRowOffset + x] = chunkData[chunkRowOffset + x];
      }
    }
  }

  /**
   * Apply a new color scheme to the existing iteration data
   */
  public applyColorScheme(colorScheme: string | null, canvas: HTMLCanvasElement | null): boolean {
    // Make sure we have iteration data and a valid canvas
    if (!this.fullCanvasIterationData || !canvas) {
      return false;
    }

    // Get the color function for the specified scheme
    let getColorFn;
    if (colorScheme && colorSchemes[colorScheme]) {
      getColorFn = colorSchemes[colorScheme];
    } else {
      return false;
    }

    // Update the current color scheme
    this.colorScheme = colorScheme;

    // Get the canvas context
    if (!canvas) return false;
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;

    // Create RGBA data for the entire canvas
    const rgbaData = new Uint8ClampedArray(this.canvasWidth * this.canvasHeight * 4);

    // Apply the color function to each pixel
    for (let i = 0; i < this.fullCanvasIterationData.length; i++) {
      const [r, g, b] = getColorFn(this.fullCanvasIterationData[i], this.parameters.maxIterations);
      const pixelIndex = i * 4;
      rgbaData[pixelIndex] = r;
      rgbaData[pixelIndex + 1] = g;
      rgbaData[pixelIndex + 2] = b;
      rgbaData[pixelIndex + 3] = 255;
    }

    // Create a new ImageData and put it on the canvas
    const imageData = new ImageData(rgbaData, this.canvasWidth, this.canvasHeight);
    ctx.putImageData(imageData, 0, 0);

    // Update the last image data
    this.lastImageData = imageData;

    return true;
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
    addChunkIfValid(centerX - chunkSize / 2, centerY - chunkSize / 2, chunkSize, chunkSize);

    // Add chunks in expanding spiral
    let layer = 1;
    while (layer * chunkSize < Math.max(width, height)) {
      // Top row of this layer
      for (let x = centerX - layer * chunkSize; x < centerX + layer * chunkSize; x += chunkSize) {
        addChunkIfValid(x, centerY - layer * chunkSize, chunkSize, chunkSize);
      }

      // Right column of this layer
      for (let y = centerY - layer * chunkSize + chunkSize; y < centerY + layer * chunkSize; y += chunkSize) {
        addChunkIfValid(centerX + layer * chunkSize - chunkSize, y, chunkSize, chunkSize);
      }

      // Bottom row of this layer
      for (let x = centerX + layer * chunkSize - 2 * chunkSize; x >= centerX - layer * chunkSize; x -= chunkSize) {
        addChunkIfValid(x, centerY + layer * chunkSize - chunkSize, chunkSize, chunkSize);
      }

      // Left column of this layer
      for (let y = centerY + layer * chunkSize - 2 * chunkSize; y > centerY - layer * chunkSize; y -= chunkSize) {
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
}

export default Mandelbrot;
