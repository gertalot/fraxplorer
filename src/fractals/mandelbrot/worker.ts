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

// Handle messages from the main thread
self.onmessage = (event: MessageEvent) => {
  const data = event.data;
  // console.log(`Worker received ${data.type} message`); // Log the message for debugging

  if (data.type === "renderChunk") {
    const { chunk, parameters, canvasWidth, canvasHeight, chunkIndex, taskId } = data as RenderChunkMessage;

    // Create a buffer to hold the pixel data for this chunk
    const buffer = new Uint32Array(chunk.width * chunk.height);

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
  buffer: Uint32Array,
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

      const pixelIndex = y * width + x;
      buffer[pixelIndex] = iter;
    }
  }
}

// Let the main thread know the worker is ready
self.postMessage({ type: "ready" });
