import { useCallback, useRef } from "react";

// Refactored to accept a function and return a debounced version of that function
export const useDebounce = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
): ((...args: Parameters<T>) => void) => {
  // Use ref to store the timeout ID
  const timeoutRef = useRef<number | null>(null);

  console.log("useDebounce called");
  // Return a memoized version of the debounced function
  return useCallback(
    (...args: Parameters<T>) => {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set a new timeout
      timeoutRef.current = window.setTimeout(() => {
        fn(...args);
        timeoutRef.current = null;
      }, delay);
    },
    [fn, delay],
  );
};
