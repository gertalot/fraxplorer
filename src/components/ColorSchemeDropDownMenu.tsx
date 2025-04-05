import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";

import colorSchemes from "../fractals/colorschemes";

interface ColorSchemeDropDownMenuProps {
  selectedScheme: string | null;
  onSchemeChange: (scheme: string) => void;
}

export const ColorSchemeDropDownMenu = ({
  selectedScheme,
  onSchemeChange,
}: ColorSchemeDropDownMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {selectedScheme || "Select Color Scheme"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full">
        {Object.keys(colorSchemes).map((scheme) => (
          <DropdownMenuItem key={scheme} onClick={() => onSchemeChange(scheme)}>
            {scheme}
            {selectedScheme === scheme && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
