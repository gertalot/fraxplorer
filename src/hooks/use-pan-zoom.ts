import { useState, useEffect, useCallback } from "react";

interface InteractionState {
  isDragging: boolean;
  dragOffset: { x: number; y: number };
  wheelDelta: { x: number; y: number };
  pointerPosition: { x: number; y: number };
}

export function usePanZoom(elementRef: React.RefObject<HTMLElement | null>, onActivity: () => void) {
  const [interactionState, setInteractionState] = useState<InteractionState>({
    isDragging: false,
    dragOffset: { x: 0, y: 0 },
    wheelDelta: { x: 0, y: 0 },
    pointerPosition: { x: 0, y: 0 },
  });

  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  // Get device pixel ratio for accurate positioning
  const getDevicePixelRatio = useCallback(() => {
    return window.devicePixelRatio || 1;
  }, []);

  // Handle pointer down event
  const handlePointerDown = useCallback(
    (e: PointerEvent) => {
      onActivity();
      setDragStart({ x: e.clientX, y: e.clientY });
      setInteractionState((prev) => ({
        ...prev,
        isDragging: true,
        pointerPosition: { x: e.clientX, y: e.clientY },
      }));
    },
    [onActivity]
  );

  // Handle pointer move event
  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      setInteractionState((prev) => ({
        ...prev,
        pointerPosition: { x: e.clientX, y: e.clientY },
      }));

      if (dragStart && interactionState.isDragging) {
        onActivity();
        const dpr = getDevicePixelRatio();
        setInteractionState((prev) => ({
          ...prev,
          dragOffset: {
            x: (e.clientX - dragStart.x) * dpr,
            y: (e.clientY - dragStart.y) * dpr,
          },
        }));
      }
    },
    [dragStart, interactionState.isDragging, onActivity, getDevicePixelRatio]
  );

  // Handle pointer up event
  const handlePointerUp = useCallback(() => {
    onActivity();
    setDragStart(null);
    setInteractionState((prev) => ({
      ...prev,
      isDragging: false,
    }));
  }, [onActivity]);

  // Handle wheel event
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      onActivity();
      const dpr = getDevicePixelRatio();
      setInteractionState((prev) => ({
        ...prev,
        wheelDelta: {
          x: prev.wheelDelta.x + e.deltaX * dpr,
          y: prev.wheelDelta.y + e.deltaY * dpr,
        },
        pointerPosition: { x: e.clientX, y: e.clientY },
      }));
    },
    [onActivity, getDevicePixelRatio]
  );

  // Set up event listeners
  useEffect(() => {
    const element = elementRef?.current;
    if (!element) return;

    element.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    element.addEventListener("wheel", handleWheel);

    return () => {
      element.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      element.removeEventListener("wheel", handleWheel);
    };
  }, [elementRef, handlePointerDown, handlePointerMove, handlePointerUp, handleWheel]);

  // Reset function to clear state
  const resetInteractionState = useCallback(() => {
    setInteractionState({
      isDragging: false,
      dragOffset: { x: 0, y: 0 },
      wheelDelta: { x: 0, y: 0 },
      pointerPosition: { x: 0, y: 0 },
    });
    setDragStart(null);
  }, []);

  return {
    ...interactionState,
    resetInteractionState,
  };
}
