import JSConfetti from "js-confetti";
import { useRef, useEffect, useCallback } from "react";

export const useConfetti = () => {
  const confettiRef = useRef<JSConfetti>();
  useEffect(() => {
    confettiRef.current = new JSConfetti();
  }, []);

  const addConfetti = useCallback(() => confettiRef.current?.addConfetti(), []);

  return { addConfetti };
};
