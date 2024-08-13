import type { Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";
import { usePrevious } from "./previous";

export function useStateProps<S>(
  initialState: S,
): [S, Dispatch<SetStateAction<S>>];
export function useStateProps<S = undefined>(): [
  S | undefined,
  Dispatch<SetStateAction<S | undefined>>,
];
export function useStateProps<S = undefined>(
  initialState?: S,
): [S | undefined, Dispatch<SetStateAction<S | undefined>>] {
  const [state, setState] = useState(initialState);
  const previousInitialState = usePrevious(initialState);

  useEffect(() => {
    if (previousInitialState !== initialState) {
      setState(initialState);
    }
  }, [initialState, previousInitialState]);

  return [state, setState];
}
