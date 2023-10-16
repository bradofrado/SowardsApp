import type { HexColor } from "model/src/core/colors";

export interface GraphValue {
  value: number;
  fill: HexColor;
}

export interface GraphComponentProps {
  values: GraphValue[];
  total: number;
}
export type GraphComponent = (props: GraphComponentProps) => JSX.Element;
