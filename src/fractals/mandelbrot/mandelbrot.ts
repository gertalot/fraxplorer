import { WorkerPool } from "@/lib/workerpool";
import { FractalParameters, iterationDataToRGBAData } from "../fractal";
import colorSchemes from "../colorschemes";
import { ColorSchemeFn } from "../colorschemes";
import { BaseFractal } from "../base-fractal";
import { createChunks, RenderChunk } from "../chunks";
import { RenderChunkMessage, WorkerResponse } from "./worker-message-types";

class Mandelbrot extends BaseFractal<FractalParameters> {
  // Rendering state
  private renderingContext: CanvasRenderingContext2D | null = null;
  private renderingCanvas: HTMLCanvasElement | null = null;
  private chunksTotal = 0;
  private chunksCompleted = 0;

  // Worker pool for parallel rendering
  private workerPool: WorkerPool | null = null;

  constructor() {
    super();
    this.initWorkerPool(new URL("./worker.ts", import.meta.url).href);
  }

  // Initialize the worker pool
  private async initWorkerPool(workerScript: string): Promise<void> {
    if (this.workerPool) return;

    // Create the worker pool
    this.workerPool = new WorkerPool({
      workerScript,
      onError: (error) => {
        console.error("Worker error:", error);
      },
    });

    // Wait for workers to initialize
    await this.workerPool.waitForInit();
    const workerCount = this.workerPool.getWorkerCount();
    console.log(`Initialized ${workerCount} worker${workerCount === 1 ? "" : "s"}`);
  }

  defaultParameters(): FractalParameters {
    return {
      maxIterations: 250,
      zoom: 1.0,
      center: { x: -1.0, y: 0 },
      // colorScheme: "default",
    };
  }

  async render(canvas: HTMLCanvasElement): Promise<void> {
    let getColorFn;
    if (this.colorScheme && colorSchemes[this.colorScheme]) {
      getColorFn = colorSchemes[this.colorScheme];
    } else {
      getColorFn = colorSchemes[Object.keys(colorSchemes)[0]];
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
    const chunks = createChunks(canvas.width, canvas.height);
    this.chunksTotal = chunks.length;
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

    console.log(`Rendering ${chunks.length} chunks`);

    const startTime = performance.now();

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

            // Get the chunk data from the result
            const { buffer, chunk: renderedChunk, chunkIndex } = result;

            // Store the iteration data in the full canvas array
            this.storeChunkIterationData(buffer, renderedChunk);

            // // Apply the color function to each pixel
            const rgbaData = iterationDataToRGBAData(
              buffer,
              chunk.width,
              chunk.height,
              this.parameters.maxIterations,
              getColorFn
            );

            // Create a new ImageData from the buffer
            const chunkImageData = new ImageData(rgbaData, renderedChunk.width, renderedChunk.height);

            // Put the chunk data into the main image data
            this.renderingContext!.putImageData(chunkImageData, renderedChunk.startX, renderedChunk.startY);

            // update the image after each chunk so the user sees what's going on
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
            this.setRenderProgress(this.chunksCompleted / this.chunksTotal);

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

              const endTime = performance.now();
              console.log(`Rendered ${chunks.length} chunks in ${(endTime - startTime).toFixed(2)}ms`);

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
}

export default Mandelbrot;
