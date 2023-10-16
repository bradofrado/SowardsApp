import { useState } from "react";

export const useExpand = (trueClass = "block", falseClass = "hidden") => {
  const [expand, setExpand] = useState(false);

  return {
    expandClass: expand ? trueClass : falseClass,
    onExpand: (force?: boolean) => setExpand(force ?? !expand),
  };
};
