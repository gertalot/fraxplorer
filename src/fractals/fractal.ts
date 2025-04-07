import { ColorSchemeFn } from "./colorschemes";

interface FractalParameters {
  maxIterations: number;
  zoom: number;
  center: { x: number; y: number };
}

interface FractalIterationResult {
  iter: number;
  zr: number;
  zi: number;
}

const canvasToFractalPoint = (
  canvasWidth: number,
  canvasHeight: number,
  point: { x: number; y: number },
  fractalCenter: { x: number; y: number },
  fractalZoom: number
) => {
  const scale = 4.0 / fractalZoom;

  return {
    x: fractalCenter.x + ((point.x - canvasWidth / 2) * scale) / canvasHeight,
    y: fractalCenter.y + ((point.y - canvasHeight / 2) * scale) / canvasHeight,
  };
};

const fractalToCanvasPoint = (
  canvasWidth: number,
  canvasHeight: number,
  point: { x: number; y: number },
  fractalCenter: { x: number; y: number },
  fractalZoom: number
) => {
  const scale = 4.0 / fractalZoom;

  return {
    x: ((point.x - fractalCenter.x) * canvasHeight) / scale + canvasWidth / 2,
    y: ((point.y - fractalCenter.y) * canvasHeight) / scale + canvasHeight / 2,
  };
};

const iterationDataToRGBAData = (
  iterationData: Uint32Array,
  width: number,
  height: number,
  maxIterations: number,
  getColorFn: ColorSchemeFn
): Uint8ClampedArray => {
  const rgbaData = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < iterationData.length; i++) {
    const [r, g, b] = getColorFn(iterationData[i], maxIterations);
    const pixelIndex = i * 4;
    rgbaData[pixelIndex] = r;
    rgbaData[pixelIndex + 1] = g;
    rgbaData[pixelIndex + 2] = b;
    rgbaData[pixelIndex + 3] = 255;
  }

  return rgbaData;
};
interface Fractal<TParameters extends FractalParameters> {
  parameters: TParameters;
  colorScheme: string | null;

  defaultParameters: () => TParameters;
  preview: (canvas: HTMLCanvasElement) => void;
  render: (canvas: HTMLCanvasElement) => void;
  applyColorScheme: (colorScheme: string | null, canvas: HTMLCanvasElement | null) => boolean;
}

export type { FractalParameters, Fractal, FractalIterationResult };
export { canvasToFractalPoint, fractalToCanvasPoint, iterationDataToRGBAData };
export default Fractal;
