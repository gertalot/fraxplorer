interface FractalParameters {
  maxIterations: number;
  zoom: number;
  center: { x: number; y: number };
  colorScheme: string | null;
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

interface Fractal<TParameters extends FractalParameters> {
  parameters: TParameters;

  defaultParameters: () => TParameters;
  preview: (canvas: HTMLCanvasElement) => void;
  render: (canvas: HTMLCanvasElement) => void;
  applyColorScheme: (colorScheme: string | null, canvas: HTMLCanvasElement | null) => boolean;
}

export type { FractalParameters, Fractal };
export { canvasToFractalPoint, fractalToCanvasPoint };
export default Fractal;
