import { useEffect, useState } from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";

import styles from "./UI.module.css";
import { UITrigger } from "./UITrigger";
import { ColorSchemeDropDownMenu } from "./ColorSchemeDropDownMenu";
import colorSchemes from "@/fractals/colorschemes";

interface UIProps {
  colorScheme: string | null;
  onSchemeChange: (scheme: string) => void;
  progress: number;
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

const UI = ({ colorScheme, onSchemeChange, progress }: UIProps) => {
  const [isOpened, setIsOpened] = useState(false);
  const [showSchemeName, setShowSchemeName] = useState(false);
  const [currentSchemeName, setCurrentSchemeName] = useState("");

  useGlobalKeyHandler(colorScheme, (scheme) => {
    onSchemeChange(scheme);
    setCurrentSchemeName(scheme);
    setShowSchemeName(true);
    setTimeout(() => setShowSchemeName(false), 2000);
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
              <h4 className="font-medium leading-none">Color Scheme</h4>
              <p className="text-sm text-muted-foreground">
                <ColorSchemeDropDownMenu selectedScheme={colorScheme} onSchemeChange={onSchemeChange} />
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {progress > 0 && progress < 1 && (
        <div className="fixed bottom-6 left-12 w-48">
          <Progress value={progress * 100} />
        </div>
      )}
      {showSchemeName && (
        <div
          className={`${styles.animateFadeInOut} fixed bottom-6 left-12 bg-black/70 text-white px-4 py-2 
            rounded-lg backdrop-blur-sm`}
        >
          Applying Color Scheme &quot;{currentSchemeName}&quot;...
        </div>
      )}
    </>
  );
};

export default UI;
