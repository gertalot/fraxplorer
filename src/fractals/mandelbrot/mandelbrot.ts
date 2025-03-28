import Fractal from "../fractal";

const defaultSettings = {
  maxIterations: 250,
  zoom: 1.5,
  center: { x: -1.0, y: 0 },
};

function render(canvas: HTMLCanvasElement) {
  const settings = { ...defaultSettings };
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const width = canvas.width;
  const height = canvas.height;
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  const scale = 4.0 / settings.zoom;

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      // Convert pixel coordinate to complex number
      const real = settings.center.x + ((x - width / 2) * scale) / height;
      const imag = settings.center.y + ((y - height / 2) * scale) / height;

      let zr = 0;
      let zi = 0;
      let iter = 0;

      while (zr * zr + zi * zi < 4 && iter < settings.maxIterations) {
        const newZr = zr * zr - zi * zi + real;
        zi = 2 * zr * zi + imag;
        zr = newZr;
        iter++;
      }

      // Compute color based on number of iterations
      const color = iter === settings.maxIterations ? 0 : iter * 4;
      const pixelIndex = (y * width + x) * 4;

      data[pixelIndex] = color;
      data[pixelIndex + 1] = color;
      data[pixelIndex + 2] = color;
      data[pixelIndex + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

const mandelbrot: Fractal = {
  ui: () => {},
  render: render,
};

export default mandelbrot;
