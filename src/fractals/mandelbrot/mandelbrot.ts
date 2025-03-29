import Fractal from "../fractal";

class Mandelbrot implements Fractal {
  canvas: HTMLCanvasElement | null = null;
  lastImageData: ImageData | null = null;
  offset: { x: number; y: number } = { x: 0, y: 0 };

  maxIterations: number = 250;
  zoom: number = 1.0;
  center: { x: number; y: number } = { x: -1.0, y: 0 };

  constructor() {}

  setCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  ui() {
    //
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

    const scale = 4.0 / this.zoom;

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
  }

  startMove() {
    if (!this.canvas) return;
    const ctx = this.canvas.getContext("2d");
    if (!ctx) return;
    if (!this.lastImageData) {
      this.lastImageData = ctx.getImageData(
        0,
        0,
        this.canvas.width,
        this.canvas.height,
      );
    }
  }

  move(offset: { x: number; y: number; zoom?: number }) {
    if (!this.canvas) return;
    const ctx = this.canvas.getContext("2d");
    if (!ctx) return;
    if (!this.lastImageData) return;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.putImageData(this.lastImageData, offset.x, offset.y);

    // Convert pixel offset to fractal coordinates
    const scale = 4.0 / this.zoom;
    this.offset = {
      x: (offset.x * scale) / this.canvas.height,
      y: (offset.y * scale) / this.canvas.height,
    };
  }

  stopMove() {
    // Subtract because dragging direction is inverse to fractal movement
    this.center = {
      x: this.center.x - this.offset.x,
      y: this.center.y - this.offset.y,
    };
    this.offset = { x: 0, y: 0 };
    this.lastImageData = null;
  }

  setCenter(pixelCoords: { x: number; y: number }) {
    if (!this.canvas) return;
    const scale = 4.0 / this.zoom;
    // Convert pixel coordinates to fractal space with proper centering
    this.center = {
      x: ((pixelCoords.x - this.canvas.width / 2) * scale) / this.canvas.height,
      y:
        ((pixelCoords.y - this.canvas.height / 2) * scale) / this.canvas.height,
    };
    console.log("setCenter", this.center);
  }
}

export default Mandelbrot;
