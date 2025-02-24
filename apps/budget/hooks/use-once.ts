import { useEffect, useRef } from "react";

export function useOnce(fn: () => unknown, condition: boolean): void {
  const hasRun = useRef<boolean>(false);
  useEffect(() => {
    if (condition && !hasRun.current) {
      fn();
      hasRun.current = true;
    }
  }, [condition]);
}
