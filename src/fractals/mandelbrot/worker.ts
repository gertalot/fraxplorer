import { canvasToFractalPoint } from "../fractal";
import { RenderChunkMessage, WorkerResponse } from "./worker-message-types";

// Explicitly declare the worker context to get the correct typings
// @ts-expect-error DedicatedWorkerGlobalScope is only defined in workers
declare const self: DedicatedWorkerGlobalScope;

// Handle messages from the main thread
self.onmessage = (event: MessageEvent<RenderChunkMessage>) => {
  const data = event.data;

  // we only have one message type...
  if (data.type === "renderChunk") {
    const [response, transferables] = onRenderChunkMessage(data);
    self.postMessage(response, transferables);
  }
};

/**
 * Takes parameters from the main thread and renders a chunk of the fractal
 * @param data a RenderChunkMessage from the main thread
 * @returns a WorkerResponse and a rendered buffer with escape orbit data
 */
function onRenderChunkMessage(data: RenderChunkMessage): [WorkerResponse, Transferable[]] {
  const { chunk, parameters, canvasWidth, canvasHeight, chunkIndex, taskId } = data;
  const buffer = new Uint32Array(chunk.width * chunk.height);
  renderChunk(chunk, parameters, canvasWidth, canvasHeight, buffer);
  return [
    {
      type: "chunkComplete",
      chunk,
      chunkIndex,
      taskId,
      buffer,
    },
    [buffer.buffer],
  ];
}

// Renders a chunk of the fractal
function renderChunk(
  chunk: RenderChunkMessage["chunk"],
  parameters: RenderChunkMessage["parameters"],
  canvasWidth: number,
  canvasHeight: number,
  buffer: Uint32Array
): void {
  const { startX, startY, width, height } = chunk;
  const { zoom, center, maxIterations } = parameters;

  // Process each pixel in the chunk
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      // map from pixel space to the complex plane of the fractal space
      const { x: real, y: imag } = canvasToFractalPoint(
        canvasWidth,
        canvasHeight,
        { x: startX + x, y: startY + y },
        center,
        zoom
      );

      const iter = compute(real, imag, maxIterations);
      const pixelIndex = y * width + x;
      buffer[pixelIndex] = iter;
    }
  }
}

/**
 * The core mandelbrot computation, z = z^2 + c
 * @param x
 * @param y
 * @param parameters
 * @param chunk
 * @param canvasWidth
 * @param canvasHeight
 * @returns
 */
function compute(real: number, imag: number, maxIterations: number): number {
  // Calculate Mandelbrot set iteration count
  let zr = 0;
  let zi = 0;
  let iter = 0;

  while (zr * zr + zi * zi < 4 && iter < maxIterations) {
    const newZr = zr * zr - zi * zi + real;
    zi = 2 * zr * zi + imag;
    zr = newZr;
    iter++;
  }
  return iter;
}

// Let the main thread know the worker is ready
self.postMessage({ type: "ready" });
