import "@/App.css";
import { Canvas } from "@/components/Canvas";
import { ThemeProvider } from "@/components/theme-provider";
import UI from "@/components/UI";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="fraxplorer-ui-theme">
      <div className="h-screen w-screen">
        <Canvas />
        <UI />
      </div>
    </ThemeProvider>
  );
}

export default App;
