export const pixelToFractalCoordinate = (
  point: { x: number; y: number },
  width: number,
  height: number,
  center: { x: number; y: number },
  zoom: number
) => {
  return {
    x: (4 / zoom) * (point.x / width) - 2 / zoom + center.x,
    y: (4 / zoom) * (point.y / height) - 2 / zoom + center.y,
  };
};

export const fractalToPixelCoordinate = (
  point: { x: number; y: number },
  width: number,
  height: number,
  center: { x: number; y: number },
  zoom: number
) => {
  return {
    x: (width * ((point.x - center.x) * (zoom / 2) + 1)) / 2,
    y: (height * ((point.y - center.y) * (zoom / 2) + 1)) / 2,
  };
};
