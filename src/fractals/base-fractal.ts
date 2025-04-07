import { iterationDataToRGBAData, type Fractal, type FractalParameters } from "./fractal";
import colorSchemes from "./colorschemes";

/**
 * Base class for fractal implementations that provides common functionality
 * like preview rendering and color scheme application
 */
export abstract class BaseFractal<TParameters extends FractalParameters> implements Fractal<TParameters> {
  // parameters that define the fractal
  parameters: TParameters;
  colorScheme: string | null;

  // data we need for fast previews
  protected lastImageData: ImageData | null = null;
  protected lastCenter: { x: number; y: number } | null = null;
  protected lastZoom: number | null = null;

  // Store iteration data for the entire canvas
  protected fullCanvasIterationData: Uint32Array | null = null;
  protected canvasWidth = 0;
  protected canvasHeight = 0;

  constructor() {
    this.parameters = this.defaultParameters();
    this.colorScheme = Object.keys(colorSchemes)[0];
  }

  abstract defaultParameters(): TParameters;
  abstract render(canvas: HTMLCanvasElement): Promise<void>;

  /**
   * Preview method for fast rendering during user interactions
   * This is fractal-agnostic and can be used by any fractal implementation
   */
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

    // // Apply the color function to each pixel
    const rgbaData = iterationDataToRGBAData(
      this.fullCanvasIterationData,
      this.canvasWidth,
      this.canvasHeight,
      this.parameters.maxIterations,
      getColorFn
    );

    // Create a new ImageData and put it on the canvas
    const imageData = new ImageData(rgbaData, this.canvasWidth, this.canvasHeight);
    ctx.putImageData(imageData, 0, 0);

    // Update the last image data
    this.lastImageData = imageData;

    return true;
  }

  // Rendering state management
  protected renderingInProgress = false;
  protected onProgressCallback: ((progress: number) => void) | null = null;
  protected onCompleteCallback: (() => void) | null = null;

  // protected renderingContext: CanvasRenderingContext2D | null = null;
  // protected renderingCanvas: HTMLCanvasElement | null = null;
  protected renderingProgress = 0;
  // protected chunksTotal = 0;
  // protected chunksCompleted = 0;

  setRenderProgress(progress: number): void {
    this.renderingProgress = progress;
    if (this.onProgressCallback) {
      this.onProgressCallback(progress);
    }
  }

  // Set a callback to be called when rendering progress updates
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

  // Update the stored center and zoom for future previews
  protected updatePreviewData(): void {
    if (this.parameters.center && this.parameters.zoom) {
      this.lastCenter = {
        x: this.parameters.center.x,
        y: this.parameters.center.y,
      };
      this.lastZoom = this.parameters.zoom;
    }
  }

  // Store a chunk's iteration data in the full canvas array
  protected storeChunkIterationData(
    chunkData: Uint32Array,
    chunk: { startX: number; startY: number; width: number; height: number }
  ): void {
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
}
