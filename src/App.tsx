import "@/App.css";
import { Canvas } from "./components/Canvas";
import { UI } from "./components/UI";

/**
 * Renders a canvas that fills the window, and a UI component.

 * @returns The main application
 */
function App() {
  return (
    <div className="h-screen w-screen">
      <Canvas />
      <UI />
    </div>
  );
}

export default App;
