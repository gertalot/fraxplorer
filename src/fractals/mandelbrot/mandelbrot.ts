import { Fractal, FractalParameters } from "../fractal";

class Mandelbrot implements Fractal<FractalParameters> {
  parameters: FractalParameters;

  // store the last image data so we can quickly preview
  private lastImageData: ImageData | null = null;

  // store last fractal center for previews
  private lastCenter: { x: number; y: number } | null = null;

  private lastZoom: number | null = null;

  constructor() {
    console.log("Mandelbrot constructor");
    this.parameters = this.defaultParameters();
  }

  defaultParameters(): FractalParameters {
    return {
      maxIterations: 250,
      zoom: 1.0,
      center: { x: -1.0, y: 0 },
    };
  }

  preview(canvas: HTMLCanvasElement) {
    console.log("preview", this.parameters.center, this.parameters.zoom);

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

      const offsetX =
        (canvas.width - this.lastImageData.width * previewScale) / 2;
      const offsetY =
        (canvas.height - this.lastImageData.height * previewScale) / 2;

      // calculate offset in pixels based on center offset
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

  render(canvas: HTMLCanvasElement) {
    console.log("render", this.parameters, {
      width: canvas.width,
      height: canvas.height,
    });

    // first reset some preview parameters
    this.lastCenter = null;
    this.lastZoom = null;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const width = canvas.width;
    const height = canvas.height;
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    const scale = 4.0 / this.parameters.zoom;

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        // Convert pixel coordinate to complex number
        const real =
          this.parameters.center.x + ((x - width / 2) * scale) / height;
        const imag =
          this.parameters.center.y + ((y - height / 2) * scale) / height;

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
        const color = iter === this.parameters.maxIterations ? 0 : iter * 4;
        const pixelIndex = (y * width + x) * 4;

        data[pixelIndex] = color;
        data[pixelIndex + 1] = color;
        data[pixelIndex + 2] = color;
        data[pixelIndex + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
    this.lastImageData = imageData;
    this.lastZoom = this.parameters.zoom;
  }
}

/*
class Mandelbrot {
  canvas: HTMLCanvasElement | null = null;

  // for zooming and transforming
  private lastImageData: ImageData | null = null;
  private startPos: { x: number; y: number } | null = null;
  private startZoom: number | null = 1.0;
  private offset: { x: number; y: number } = { x: 0, y: 0 };

  // for idle timeout trigger that executes after the
  // transform method is called for the last time
  private idleTimeout: number | null = null;
  private TIMEOUT_MS: number = 500;

  // mandelbrot parameters
  maxIterations: number = 100;
  zoomFactor: number = 1.0;
  center: { x: number; y: number } = { x: -1.0, y: 0 };

  constructor() {}

  setCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  transform(offset: { x: number; y: number }, zoom: number) {
    if (!this.canvas) return;
    const ctx = this.canvas.getContext("2d");
    if (!ctx) return;

    // cancel existing timeout. New timeout is set up
    // at the end of this method, which runs when the user
    // is done doing its transforming thing.
    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout);
    }

    // no image data and no startPos means we're just starting the
    // drag or zoom, so set up a starting point. We're saving the
    // image data so we can move it to where the pointer is moving.
    // we're saving the startPos so we can compute the offset.
    if (!this.lastImageData) {
      this.lastImageData = ctx.getImageData(
        0,
        0,
        this.canvas.width,
        this.canvas.height,
      );
    }
    if (!this.startPos) {
      this.startPos = { x: offset.x, y: offset.y };
    }
    if (!this.startZoom) {
      this.startZoom = this.zoomFactor;
    }

    const dpr = window.devicePixelRatio;
    const posDelta = {
      x: (offset.x - this.startPos.x) * dpr,
      y: (offset.y - this.startPos.y) * dpr,
    };

    if (posDelta.x === 0 && posDelta.y === 0) {
      console.log("zooming", zoom);

      // create a new canvas to hold the image
      const tmpCanvas = document.createElement("canvas");
      tmpCanvas.width = this.canvas.width;
      tmpCanvas.height = this.canvas.height;
      const tmpCtx = tmpCanvas.getContext("2d");
      tmpCtx?.putImageData(this.lastImageData, 0, 0);

      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.save();

      // Apply scaling centered on canvas
      ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2);
      ctx.drawImage(tmpCanvas, 0, 0);
      ctx.restore();

      this.zoomFactor = this.startZoom * zoom;
    } else if (zoom === 1) {
      console.log("dragging", posDelta);
      // translate
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.putImageData(this.lastImageData, posDelta.x, posDelta.y);
      // Convert pixel offset to fractal coordinates
      const scale = (4.0 / this.zoomFactor) * zoom;
      this.offset = {
        x: (posDelta.x * scale) / this.canvas.height,
        y: (posDelta.y * scale) / this.canvas.height,
      };
    }

    // set up timeout that triggers after the user has stopped
    // dragging or zooming.
    this.idleTimeout = window.setTimeout(() => {
      this.stopTransform();
    }, this.TIMEOUT_MS); // Adjust the timeout duration as needed
  }

  stopTransform() {
    console.log("stopTransform");
    this.center = {
      x: this.center.x - this.offset.x,
      y: this.center.y - this.offset.y,
    };
    this.offset = { x: 0, y: 0 };
    this.startPos = null;
    this.lastImageData = null;
    this.startZoom = null;
    this.render();
  }

  // startZoom() {
  //   if (!this.canvas) return;
  //   const ctx = this.canvas.getContext("2d");
  //   if (!ctx) return;
  //   if (!this.lastImageData) {
  //     this.lastImageData = ctx.getImageData(
  //       0,
  //       0,
  //       this.canvas.width,
  //       this.canvas.height,
  //     );
  //   }
  //   this.isZooming = true;
  //   this.initialZoom = this.zoomFactor;
  //   this.tempZoomFactor = 1.0;
  // }

  // // Add new property to class
  // private previewCanvas: HTMLCanvasElement | null = null;

  // // Modify zoom method
  // zoom(delta: number) {
  //   if (!this.isZooming || !this.canvas || !this.lastImageData) return;
  //   const ctx = this.canvas.getContext("2d");
  //   if (!ctx) return;

  //   // Update temporary zoom factor
  //   this.tempZoomFactor *= delta;

  //   // Create preview canvas if needed
  //   if (!this.previewCanvas) {
  //     this.previewCanvas = document.createElement("canvas");
  //     this.previewCanvas.width = this.canvas.width;
  //     this.previewCanvas.height = this.canvas.height;
  //     const previewCtx = this.previewCanvas.getContext("2d");
  //     previewCtx?.putImageData(this.lastImageData, 0, 0);
  //   }

  //   // Clear and apply scale transform
  //   ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  //   ctx.save();

  //   const currentZoom = this.initialZoom * this.tempZoomFactor;
  //   const scaleFactor = currentZoom / this.initialZoom;

  //   // Apply scaling centered on canvas
  //   ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
  //   ctx.scale(scaleFactor, scaleFactor);
  //   ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2);

  //   if (this.previewCanvas) {
  //     ctx.drawImage(this.previewCanvas, 0, 0);
  //   }

  //   ctx.restore();
  // }

  // // Modify stopZoom
  // stopZoom() {
  //   if (!this.isZooming) return;
  //   this.isZooming = false;
  //   this.zoomFactor = this.initialZoom * this.tempZoomFactor;
  //   this.previewCanvas = null;
  //   this.lastImageData = null;
  // }

  setCenter(pixelCoords: { x: number; y: number }) {
    if (!this.canvas) return;
    const scale = 4.0 / this.zoomFactor;
    // Convert pixel coordinates to fractal space with proper centering
    this.center = {
      x: ((pixelCoords.x - this.canvas.width / 2) * scale) / this.canvas.height,
      y:
        ((pixelCoords.y - this.canvas.height / 2) * scale) / this.canvas.height,
    };
  }

  render() {
    console.log("rendering mandelbrot");
    if (!this.canvas) return;
    const ctx = this.canvas.getContext("2d");
    if (!ctx) return;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    const scale = 4.0 / this.zoomFactor;

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        // Convert pixel coordinate to complex number
        const real = this.center.x + ((x - width / 2) * scale) / height;
        const imag = this.center.y + ((y - height / 2) * scale) / height;

        let zr = 0;
        let zi = 0;
        let iter = 0;

        while (zr * zr + zi * zi < 4 && iter < this.maxIterations) {
          const newZr = zr * zr - zi * zi + real;
          zi = 2 * zr * zi + imag;
          zr = newZr;
          iter++;
        }

        // Compute color based on number of iterations
        const color = iter === this.maxIterations ? 0 : iter * 4;
        const pixelIndex = (y * width + x) * 4;

        data[pixelIndex] = color;
        data[pixelIndex + 1] = color;
        data[pixelIndex + 2] = color;
        data[pixelIndex + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
    console.log("rendered mandelbrot done");
  }
}
*/
export default Mandelbrot;
