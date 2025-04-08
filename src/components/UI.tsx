import { useEffect, useState } from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ProgressBar } from "./ProgressBar";

import styles from "./UI.module.css";
import { UITrigger } from "./UITrigger";
import { ColorSchemeDropDownMenu } from "./ColorSchemeDropDownMenu";
import colorSchemes from "@/fractals/colorschemes";
import { FractalParameters } from "@/fractals/fractal";
import { Button } from "./ui/button";
import { Maximize, Minimize } from "lucide-react";

interface UIProps {
  colorScheme: string | null;
  onSchemeChange: (scheme: string) => void;
  parameters: FractalParameters;
  progress: number;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

function useGlobalKeyHandler(selectedScheme: string | null, onSchemeChange: (scheme: string) => void) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const schemes = Object.keys(colorSchemes);
      const currentIndex = selectedScheme ? schemes.indexOf(selectedScheme) : -1;

      if (e.key === "]" && !e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % schemes.length;
        onSchemeChange(schemes[nextIndex]);
      } else if (e.key === "[" && !e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault();
        const prevIndex = (currentIndex - 1 + schemes.length) % schemes.length;
        onSchemeChange(schemes[prevIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [selectedScheme, onSchemeChange]);
}

const UI = ({ colorScheme, onSchemeChange, parameters, progress, isFullscreen, onToggleFullscreen }: UIProps) => {
  const [isOpened, setIsOpened] = useState(false);
  const [showSchemeName, setShowSchemeName] = useState(false);
  const [currentSchemeName, setCurrentSchemeName] = useState("");
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useGlobalKeyHandler(colorScheme, (scheme) => {
    onSchemeChange(scheme);
    setCurrentSchemeName(scheme);
    setIsFadingOut(false);
    setShowSchemeName(true);

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    setTimeoutId(
      setTimeout(() => {
        setIsFadingOut(true);
        setTimeout(() => setShowSchemeName(false), 200); // Match CSS animation duration
      }, 2000)
    );
  });

  return (
    <>
      <Popover open={isOpened} onOpenChange={setIsOpened}>
        <PopoverTrigger>
          <UITrigger isOpened={isOpened} />
        </PopoverTrigger>
        <PopoverContent className="fixed bottom-18 left-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Parameters</h4>
              <p className="text-sm text-muted-foreground">
                x: {parameters.center.x}
                <br />
                y: {parameters.center.y}
                <br />
                Zoom: {parameters.zoom.toFixed(2)}x
              </p>
              <p className="text-sm text-muted-foreground">Iterations: {parameters.maxIterations.toFixed(0)}</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Color Scheme</h4>
              <p className="text-sm text-muted-foreground">
                <ColorSchemeDropDownMenu selectedScheme={colorScheme} onSchemeChange={onSchemeChange} />
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Controls</h4>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/30 cursor-pointer"
                onClick={onToggleFullscreen}
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <ProgressBar progress={progress} />
      {showSchemeName && (
        <div
          className={`${isFadingOut ? styles.animateFadeOut : styles.animateFadeIn} fixed bottom-6 left-12 bg-black/70 text-white px-4 py-2 rounded-lg backdrop-blur-sm`}
        >
          Applying Color Scheme &quot;{currentSchemeName}&quot;...
        </div>
      )}
    </>
  );
};

export default UI;
