import type { Fractal, FractalParameters } from "./fractal";
import Mandelbrot from "./mandelbrot/mandelbrot";

// Define the types of fractals we support
export type FractalType = "mandelbrot" | "julia";

/**
 * Factory class for creating different types of fractals
 */
export class FractalFactory {
  /**
   * Create a new fractal instance of the specified type
   */
  static createFractal(type: FractalType): Fractal<FractalParameters> {
    switch (type) {
      case "mandelbrot":
        return new Mandelbrot();
      default:
        throw new Error(`Unknown fractal type: ${type}`);
    }
  }
}
