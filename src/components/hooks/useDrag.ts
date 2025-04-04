const useDrag = (
  move: (center: { x: number; y: number }, zoom: number) => void,
) => {
  const handlePointerDown = () => {
    const handlePointerMove = (e: PointerEvent) => {
      move({ x: e.clientX, y: e.clientY }, 1);
    };

    const handlePointerUp = () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    };

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
  };

  return handlePointerDown;
};

export default useDrag;
