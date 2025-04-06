// Define the message types for communication with the main thread
// interface WorkerInitMessage {
//   type: "init";
//   colorSchemes: Record<string, (iter: number, maxIter: number) => [number, number, number]>;
// }

interface RenderChunkMessage {
  type: "renderChunk";
  chunk: {
    startX: number;
    startY: number;
    width: number;
    height: number;
  };
  parameters: {
    maxIterations: number;
    zoom: number;
    center: { x: number; y: number };
    colorScheme: string;
  };
  canvasWidth: number;
  canvasHeight: number;
  chunkIndex: number;
  taskId?: number;
}

// Explicitly declare the worker context to get the correct typings
// @ts-expect-error DedicatedWorkerGlobalScope is only defined in workers
declare const self: DedicatedWorkerGlobalScope;

const firePalette = (iter: number, maxIterations: number) => {
  if (iter === maxIterations) return [0, 0, 0];

  const ratio = iter / maxIterations;
  // From black to red to yellow to white
  if (ratio < 0.2) {
    const r = Math.round(ratio * 5 * 255);
    return [r, 0, 0];
  } else if (ratio < 0.5) {
    const g = Math.round((ratio - 0.2) * 3.33 * 255);
    return [255, g, 0];
  } else {
    const b = Math.round((ratio - 0.5) * 2 * 255);
    const r = 255;
    const g = 255;
    return [r, g, b];
  }
};
// Handle messages from the main thread
self.onmessage = (event: MessageEvent) => {
  const data = event.data;
  // console.log(`Worker received ${data.type} message`); // Log the message for debugging

  if (data.type === "renderChunk") {
    const { chunk, parameters, canvasWidth, canvasHeight, chunkIndex, taskId } = data as RenderChunkMessage;

    // Create a buffer to hold the pixel data for this chunk
    const buffer = new Uint8ClampedArray(chunk.width * chunk.height * 4);

    // Render the chunk
    renderChunk(chunk, buffer, parameters, canvasWidth, canvasHeight, chunkIndex);

    // Send the rendered chunk back to the main thread
    self.postMessage(
      {
        type: "chunkComplete",
        chunkIndex,
        buffer,
        chunk,
        taskId, // Include taskId for worker pool
      },
      [buffer.buffer]
    ); // Transfer the buffer to avoid copying
  }
};

// Function to render a chunk of the Mandelbrot set
function renderChunk(
  chunk: { startX: number; startY: number; width: number; height: number },
  buffer: Uint8ClampedArray,
  parameters: {
    maxIterations: number;
    zoom: number;
    center: { x: number; y: number };
    colorScheme: string;
  },
  canvasWidth: number,
  canvasHeight: number,
  _chunkIndex: number
): void {
  const { startX, startY, width, height } = chunk;
  const { maxIterations, zoom, center } = parameters;

  // console.log(`Rendering chunk ${startX}, ${startY} - ${startX + width}, ${startY + height}`, parameters);

  const scale = 4.0 / zoom;

  // Process each pixel in the chunk
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      // Convert pixel coordinate to complex number
      const real = center.x + ((startX + x - canvasWidth / 2) * scale) / canvasHeight;
      const imag = center.y + ((startY + y - canvasHeight / 2) * scale) / canvasHeight;

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

      // TODO: don't compute colors here; return the iterations instead
      // and let the main thread apply colors

      // Compute color based on number of iterations
      const [r, g, b] = firePalette(iter, maxIterations);
      const pixelIndex = (y * width + x) * 4;

      buffer[pixelIndex] = r;
      buffer[pixelIndex + 1] = g;
      buffer[pixelIndex + 2] = b;
      buffer[pixelIndex + 3] = 255;
    }
  }
}

// Let the main thread know the worker is ready
self.postMessage({ type: "ready" });
