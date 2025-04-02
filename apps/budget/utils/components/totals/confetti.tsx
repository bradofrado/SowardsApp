"use client";
import { useEffect } from "react";
import { useConfetti } from "../../hooks/confetti";

export const Confetti: React.FunctionComponent = () => {
  const { addConfetti } = useConfetti();

  useEffect(() => {
    addConfetti();
  }, [addConfetti]);

  return null;
};
