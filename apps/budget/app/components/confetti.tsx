"use client";
import { useEffect } from "react";
import { useQueryState } from "ui/src/hooks/query-state";
import { useConfetti } from "../../utils/hooks/confetti";

export const Confetti: React.FunctionComponent = () => {
  const [confetti, setConfetti] = useQueryState<boolean | null>({
    key: "setup-complete",
  });
  const { addConfetti } = useConfetti();

  useEffect(() => {
    if (confetti) {
      addConfetti();
      setConfetti(null);
    }
  }, [confetti, addConfetti, setConfetti]);

  return null;
};
