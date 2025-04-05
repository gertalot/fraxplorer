import colorSchemes from "../colorschemes";
import { Fractal, FractalParameters } from "../fractal";

class Mandelbrot implements Fractal<FractalParameters> {
  parameters: FractalParameters;

  // store the last image data so we can quickly preview
  private lastImageData: ImageData | null = null;

  // store last fractal center for previews
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

    const selectedColorScheme =
      this.parameters.colorScheme || Object.keys(colorSchemes)[0];
    const getColor = colorSchemes[selectedColorScheme];

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
        // const color = iter === this.parameters.maxIterations ? 0 : iter * 4;
        const [r, g, b] = getColor(iter, this.parameters.maxIterations);
        const pixelIndex = (y * width + x) * 4;

        data[pixelIndex] = r;
        data[pixelIndex + 1] = g;
        data[pixelIndex + 2] = b;
        data[pixelIndex + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
    this.lastImageData = imageData;
    this.lastZoom = this.parameters.zoom;
  }
}

export default Mandelbrot;
