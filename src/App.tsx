import "@/App.css";
import { Canvas } from "@/components/Canvas";
import { ThemeProvider } from "@/components/theme-provider";
import UI from "@/components/UI";
import Mandelbrot from "./fractals/mandelbrot/mandelbrot";
import { useState, useEffect, useRef } from "react";

/**
 * Renders a canvas that fills the window, and a UI component.

 * @returns The main application
 */
function App() {
  const appContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize fractal with stored values
  const [fractal] = useState(() => {
    const savedParams = localStorage.getItem("fraxplorer-parameters");
    const initialParams = savedParams ? JSON.parse(savedParams) : undefined;
    const initialColorScheme = localStorage.getItem("fraxplorer-colorScheme") || null;
    return new Mandelbrot({
      parameters: initialParams,
      colorScheme: initialColorScheme,
    });
  });

  // Initialize state from fractal's properties
  const [colorScheme, setColorScheme] = useState(fractal.colorScheme);
  const [parameters, setParameters] = useState(fractal.parameters);
  const [progress, setProgress] = useState<number>(0);

  // Persist color scheme changes
  useEffect(() => {
    if (colorScheme) {
      localStorage.setItem("fraxplorer-colorScheme", colorScheme);
    } else {
      localStorage.removeItem("fraxplorer-colorScheme");
    }
  }, [colorScheme]);

  // Persist parameter changes
  useEffect(() => {
    localStorage.setItem("fraxplorer-parameters", JSON.stringify(parameters));
  }, [parameters]);

  // Update fractal when parameters change
  useEffect(() => {
    fractal.parameters = parameters;
    fractal.cancelRendering();
  }, [fractal, parameters]);

  useEffect(() => {
    fractal.onProgress((progress: number) => {
      setProgress(progress);
    });
  }, [fractal]);

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement !== null);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    if (!isFullscreen) {
      try {
        if (appContainerRef.current) {
          await appContainerRef.current.requestFullscreen();
        }
      } catch (err) {
        console.error("Error attempting to enable fullscreen:", err);
      }
    } else {
      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        }
      } catch (err) {
        console.error("Error attempting to exit fullscreen:", err);
      }
    }
  };

  return (
    <ThemeProvider defaultTheme="system" storageKey="fraxplorer-ui-theme">
      <div ref={appContainerRef} className="h-screen w-screen">
        <Canvas fractal={fractal} colorScheme={colorScheme} onParametersChange={setParameters} />
        <UI
          colorScheme={colorScheme}
          onSchemeChange={setColorScheme}
          progress={progress}
          parameters={parameters}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;
