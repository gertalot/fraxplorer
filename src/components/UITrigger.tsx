"use client";

import { ChevronDownIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const UITrigger = ({ isOpened }: { isOpened?: boolean }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to set the hide timeout
  const setHideTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!isHovering && !isOpened) {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 1000);
    }
  };

  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = () => {
      setIsVisible(true);
      setHideTimeout();
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isHovering, isOpened]);

  // Handle popover state changes
  useEffect(() => {
    if (isOpened) {
      setIsVisible(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    } else {
      // When popover closes, start the hide timeout
      setHideTimeout();
    }
  }, [isOpened, isHovering]);

  return (
    <ChevronDownIcon
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`
        fixed bottom-4 left-4 
        rounded-full
        ${isOpened ? "bg-neutral-500" : "bg-neutral-600"}
        hover:bg-neutral-500
        cursor-pointer
        transition-all duration-300 ease-in-out
        flex items-center justify-center
        ${isVisible || isHovering || isOpened ? "opacity-100" : "opacity-0"}
        ${isHovering || isOpened ? "scale-120" : "scale-100"}
        ${isOpened ? "rotate-180" : "rotate-0"}
      `}
    />
  );
};
