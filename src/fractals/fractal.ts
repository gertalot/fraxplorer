interface Fractal {
  setCanvas: (canvas: HTMLCanvasElement) => void;
  setCenter: (center: { x: number; y: number }) => void;
  ui: () => void;
  render: () => void;

  startTransform: () => void;
  transform: (params: {
    deltaX?: number;
    deltaY?: number;
    scale?: number;
  }) => void;
  stopTransform: () => void;
}

export default Fractal;
