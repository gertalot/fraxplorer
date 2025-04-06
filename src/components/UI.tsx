import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";

import { useState } from "react";
import { UITrigger } from "./UITrigger";
import { ColorSchemeDropDownMenu } from "./ColorSchemeDropDownMenu";

interface UIProps {
  colorScheme: string | null;
  onSchemeChange: (scheme: string) => void;
  progress: number;
}

const UI = ({ colorScheme, onSchemeChange, progress }: UIProps) => {
  const [isOpened, setIsOpened] = useState(false);

  return (
    <>
      <Popover open={isOpened} onOpenChange={setIsOpened}>
        <PopoverTrigger>
          <UITrigger isOpened={isOpened} />
        </PopoverTrigger>
        <PopoverContent className="fixed bottom-18 left-4">
          {/* Your popover content goes here */}
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
    </>
  );
};

export default UI;
