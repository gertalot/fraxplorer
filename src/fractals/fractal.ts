interface FractalParameters {
  maxIterations: number;
  zoom: number;
  center: { x: number; y: number };
  colorScheme: string | null;
}

interface Fractal<TParameters extends FractalParameters> {
  parameters: TParameters;

  defaultParameters: () => TParameters;
  preview: (canvas: HTMLCanvasElement) => void;
  render: (canvas: HTMLCanvasElement) => void;
}

export type { FractalParameters, Fractal };
export default Fractal;
