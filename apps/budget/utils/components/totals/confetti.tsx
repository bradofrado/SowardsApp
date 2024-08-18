"use client";
import { useEffect } from "react";
import { useQueryState } from "ui/src/hooks/query-state";
import { useConfetti } from "../../hooks/confetti";

export const Confetti: React.FunctionComponent = () => {
  const { addConfetti } = useConfetti();

  useEffect(() => {
    addConfetti();
  }, [addConfetti]);

  return null;
};
