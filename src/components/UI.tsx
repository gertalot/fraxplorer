import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { useState } from "react";
import { UITrigger } from "./UITrigger";

const UI = () => {
  const [isOpened, setIsOpened] = useState(false);

  return (
    <Popover open={isOpened} onOpenChange={setIsOpened}>
      <PopoverTrigger>
        <UITrigger isOpened={isOpened} />
      </PopoverTrigger>
      <PopoverContent className="fixed bottom-18 left-4">
        {/* Your popover content goes here */}
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Popover content</h4>
            <p className="text-sm text-muted-foreground">
              Add your UI controls here
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default UI;
