import type { HexColor } from "model/src/core/colors";

export interface GraphValue {
  value: number;
  fill: HexColor;
  label?: string;
}

export interface GraphComponentProps {
  className?: string;
  values: GraphValue[];
  total: number;
  totalLabel?: string;
  noSort?: boolean;
}
export type GraphComponent = (props: GraphComponentProps) => JSX.Element;
