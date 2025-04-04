import { useRef, useState } from "react";

// Update the return type signature
const useZoom = (
  zoom: (center: { x: number; y: number }, delta: number) => void,
): [
  (e: React.WheelEvent<HTMLCanvasElement>) => void,
  (e: React.TouchEvent<HTMLCanvasElement>) => void,
] => {
  const [wheelScale, setWheelScale] = useState<number | null>(null);
  const lastDistance = useRef<number | null>(null);

  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();

    if (wheelScale === null) {
      setWheelScale(1);
    } else {
      const newScale = Math.min(
        99,
        Math.max(0.0001, wheelScale - event.deltaY * 0.001),
      );
      setWheelScale(newScale);
      zoom({ x: event.clientX, y: event.clientY }, newScale);
    }
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLCanvasElement>) => {
    if (event.touches.length === 2) {
      event.preventDefault();
    }

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 2) {
        event.preventDefault();
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        // Calculate midpoint coordinates
        const midX = (touch1.clientX + touch2.clientX) / 2;
        const midY = (touch1.clientY + touch2.clientY) / 2;
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY,
        );
        if (lastDistance.current !== null) {
          const scaleFactor = distance / lastDistance.current;
          zoom({ x: midX, y: midY }, scaleFactor);
        }
        lastDistance.current = distance;
      }
    };

    const handleTouchEnd = () => {
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      lastDistance.current = null;
    };

    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);
  };

  // Return type is now explicitly typed as a tuple
  return [handleWheel, handleTouchStart];
};

export default useZoom;
