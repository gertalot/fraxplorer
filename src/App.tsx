import "@/App.css";
import { Canvas } from "@/components/Canvas";
import { ThemeProvider } from "@/components/theme-provider";
import UI from "@/components/UI";
import Mandelbrot from "./fractals/mandelbrot/mandelbrot";
import { useState } from "react";

const myFractal = new Mandelbrot();

function App() {
  const [colorScheme, setColorScheme] = useState<string | null>(null);

  return (
    <ThemeProvider defaultTheme="system" storageKey="fraxplorer-ui-theme">
      <div className="h-screen w-screen">
        <Canvas fractal={myFractal} colorScheme={colorScheme} />
        <UI colorScheme={colorScheme} onSchemeChange={setColorScheme} />
      </div>
    </ThemeProvider>
  );
}

export default App;
