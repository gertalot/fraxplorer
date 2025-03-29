interface Fractal {
  setCanvas: (canvas: HTMLCanvasElement) => void;
  setCenter: (center: { x: number; y: number }) => void;
  ui: () => void;
  render: () => void;
  startMove: () => void;
  move: (offset: { x: number; y: number; zoom?: number }) => void;
  stopMove: () => void;
}

export default Fractal;
