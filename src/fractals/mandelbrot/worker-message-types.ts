import { FractalParameters } from "../fractal";
import { RenderChunk } from "../chunks";

export interface RenderChunkMessage {
  type: "renderChunk";
  chunk: RenderChunk;
  parameters: FractalParameters;
  canvasWidth: number;
  canvasHeight: number;
  chunkIndex: number;
  taskId?: number;
}

export interface ChunkCompleteMessage {
  type: "chunkComplete";
  chunk: RenderChunk;
  chunkIndex: number;
  taskId?: number;
  buffer: Float64Array;
}

export type WorkerResponse = ChunkCompleteMessage;
