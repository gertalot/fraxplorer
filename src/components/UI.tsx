import { useState, useEffect, useRef } from "react";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { useFractalStore } from "./hooks/use-store";

export const UI = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [isPointerActive, setIsPointerActive] = useState(false); // Add new state
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { params, colorScheme } = useFractalStore();

  useEffect(() => {
    const handleMouseMove = () => setIsVisible(true);
    const handlePointerStart = () => {
      setIsVisible(true);
      setIsPointerActive(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    const handlePointerEnd = () => {
      setIsPointerActive(false); // Clear active state
      resetTimeout();
    };

    // Add wheel listener
    window.addEventListener("wheel", handleMouseMove);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handlePointerStart);
    window.addEventListener("mouseup", handlePointerEnd);
    window.addEventListener("touchstart", handlePointerStart);
    window.addEventListener("touchend", handlePointerEnd);

    return () => {
      window.removeEventListener("wheel", handleMouseMove);
      window.removeEventListener("mousedown", handlePointerStart);
      window.removeEventListener("mouseup", handlePointerEnd);
      window.removeEventListener("touchstart", handlePointerStart);
      window.removeEventListener("touchend", handlePointerEnd);
    };
  }, []);

  const resetTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (!isHovering && !isPointerActive) {
      // timeoutRef.current = setTimeout(() => setIsVisible(false), 2000);
    }
  };

  if (isVisible) {
    resetTimeout();
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div
        className={`
        flex items-center justify-between px-4 py-3
        bg-black/50 backdrop-blur-sm transition-opacity
        duration-300 ${isVisible ? "opacity-100" : "opacity-0"}
        pointer-events-none
      `}
      >
        <div className="pointer-events-auto flex space-x-4">
          <p className="text-sm text-muted-foreground pr-12">
            x: {params.center.x}, y: {params.center.y}
          </p>
          <p className="text-sm text-muted-foreground pr-12">
            zoom: {params.zoom.toFixed(2)}, maxIter: {params.maxIterations}
          </p>
          <p className="text-sm text-muted-foreground pr-12">colorScheme: {colorScheme}</p>
        </div>
        <a
          href="https://github.com/gertalot/fraxplorer"
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto text-white hover:text-gray-200 transition-colors"
        >
          <SiGithub size={24} />
        </a>
      </div>
    </div>
  );
};
