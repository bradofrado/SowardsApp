import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { formatDollarAmount } from "model/src/utils";
import type { PropsOf } from "../../../../types/polymorphics";
import { colors } from "../../../../../tailwind.config";
import type { GraphValue } from "./types";
import { usePrevious } from "../../../../hooks/previous";

type CanvasProps = PropsOf<"canvas"> & {
  draw: (context: CanvasRenderingContext2D, frameCount: number) => void;
};
const Canvas: React.FunctionComponent<CanvasProps> = ({ draw, ...rest }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!context) return;

    let frameCount = 0;
    let animationFrameId: number;

    //Our draw came here
    const render = (): void => {
      frameCount++;
      draw(context, frameCount);
      animationFrameId = window.requestAnimationFrame(render);
    };
    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [draw]);

  return <canvas ref={canvasRef} {...rest} />;
};

type DataPoint = [number, number];
interface NormalizeGraphDataRequest {
  axisLabels: number[];
  values: GraphValue[];
  width: number;
  height: number;
  spacing: number;
}
interface NormalizeGraphDataRespone {
  axisValuePositions: number[];
  dataPoints: DataPoint[];
}
const useNormalizeGraphData = ({
  axisLabels,
  values,
  width,
  height,
  spacing,
}: NormalizeGraphDataRequest): NormalizeGraphDataRespone => {
  const normalizedPoints = useMemo<DataPoint[]>(() => {
    const getNormalizerAndMin = (
      index: 0 | 1,
      data: DataPoint[],
      size: DataPoint,
    ): DataPoint => {
      const sorted = data.slice().sort((a, b) => a[index] - b[index]);
      const max = sorted[sorted.length - 1];
      const min = sorted[0];
      const normalizer = (max[index] - min[index]) / size[index];

      return [normalizer, min[index] / normalizer];
    };
    //Put things in an array so it is consistent with the points also being in an array
    const size: DataPoint = [width, height];
    const dataAndLabels = [
      ...axisLabels.map<DataPoint>((label) => [0, label]),
      ...values.map<DataPoint>(({ value }, i) => [i + 1, value]),
    ];
    const normalizerX = [1 / spacing, 0]; //getNormalizerAndMin(0, data, size);
    const normalizerY = getNormalizerAndMin(1, dataAndLabels, size);

    return dataAndLabels.map(([x, y]) => [
      x / normalizerX[0] - normalizerX[1],
      y / normalizerY[0] - normalizerY[1],
    ]);
  }, [axisLabels, values, width, height, spacing]);

  const axisValuePositions = useMemo<number[]>(
    () => normalizedPoints.slice(0, axisLabels.length).map((point) => point[1]),
    [normalizedPoints, axisLabels.length],
  );
  const dataPoints = useMemo<DataPoint[]>(
    () => normalizedPoints.slice(axisLabels.length),
    [normalizedPoints, axisLabels.length],
  );

  return {
    axisValuePositions,
    dataPoints,
  };
};

interface ClosestPointResponse {
  onMouseMove: React.MouseEventHandler;
  onMouseLeave: React.MouseEventHandler;
  closestPointIndex: number | undefined;
}
const useClosestDataPointToMouse = (
  dataPoints: DataPoint[],
): ClosestPointResponse => {
  const [hoverPosition, setHoverPosition] = useState<DataPoint | undefined>();
  const closestPointIndex = useMemo<number | undefined>(() => {
    const findClosestPoint = (point: DataPoint, data: DataPoint[]): number => {
      const sortedPoints = data
        .map(([x], index) => ({ index, distance: Math.abs(point[0] - x) }))
        .sort((a, b) => a.distance - b.distance);

      return sortedPoints[0].index;
    };

    if (hoverPosition) {
      const _closestPointIndex = findClosestPoint(hoverPosition, dataPoints);
      return _closestPointIndex;
    }

    return undefined;
  }, [hoverPosition, dataPoints]);

  const onMouseMove: React.MouseEventHandler = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverPosition([e.clientX - rect.left, e.clientY - rect.top]);
  };

  const onMouseLeave: React.MouseEventHandler = () => {
    setHoverPosition(undefined);
  };

  return {
    onMouseMove,
    onMouseLeave,
    closestPointIndex,
  };
};

export interface LineChartProps<T extends GraphValue> {
  values: T[];
  axisLabels: number[];
  children: (value: T) => React.ReactNode;
  onValueChange?: (value: T | undefined, index: number | undefined) => void;
  width: number;
  height: number;
  spacing?: number;
}
export const LineChart = <T extends GraphValue>({
  values,
  axisLabels,
  children,
  width,
  height,
  onValueChange,
  spacing = 30,
}: LineChartProps<T>): JSX.Element => {
  const { dataPoints, axisValuePositions } = useNormalizeGraphData({
    axisLabels,
    values,
    width,
    height,
    spacing,
  });
  const { onMouseLeave, onMouseMove, closestPointIndex } =
    useClosestDataPointToMouse(dataPoints);

  const previousClosestPointIndex = usePrevious(closestPointIndex);

  useEffect(() => {
    if (closestPointIndex !== previousClosestPointIndex && onValueChange) {
      onValueChange(
        closestPointIndex ? values[closestPointIndex] : undefined,
        closestPointIndex,
      );
    }
  }, [closestPointIndex, previousClosestPointIndex, onValueChange, values]);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D): void => {
      const drawPoints = (data: DataPoint[]): void => {
        const _height = ctx.canvas.height;

        ctx.setLineDash([]);
        ctx.fillStyle = "#fff";
        let last: DataPoint = [0, _height];
        for (let i = 0; i < data.length; i++) {
          const [x, y] = data[i];

          //Draw line
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(...last);
          ctx.strokeStyle = values[i].fill;
          ctx.lineTo(x, _height - y);
          last = [x, _height - y];
          ctx.stroke();
        }

        ctx.fillStyle = "#fff";
        ctx.lineWidth = 4;
        // for (let i = 0; i < data.length; i++) {
        //   const [x, y] = data[i];
        //   ctx.beginPath();
        //   ctx.arc(x, _height - y, 2, 0, 2 * Math.PI);
        //   ctx.strokeStyle = values[i].fill;
        //   ctx.stroke();
        //   ctx.fill();
        // }
      };
      const drawHoverLine = (_closestPointIndex: number): void => {
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = values[_closestPointIndex].fill;
        ctx.setLineDash([]);
        ctx.moveTo(dataPoints[_closestPointIndex][0], 0);

        ctx.lineTo(dataPoints[_closestPointIndex][0], ctx.canvas.height);
        ctx.stroke();
      };
      const drawAxisLines = (axisPoints: number[]): void => {
        ctx.beginPath();
        ctx.setLineDash([2]);
        ctx.strokeStyle = "#d1d5db";
        ctx.lineWidth = 1;
        for (const point of axisPoints) {
          ctx.moveTo(0, ctx.canvas.height - point);
          ctx.lineTo(ctx.canvas.width, ctx.canvas.height - point);
        }
        ctx.stroke();
      };

      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillStyle = "#000000";

      if (closestPointIndex !== undefined) {
        drawHoverLine(closestPointIndex);
      }

      drawAxisLines(axisValuePositions);
      drawPoints(dataPoints);
    },
    [closestPointIndex, values, axisValuePositions, dataPoints],
  );

  return (
    <div className="py-4">
      <div
        className="relative"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <div
          className="absolute left-10"
          onMouseLeave={onMouseLeave}
          onMouseMove={onMouseMove}
        >
          <Canvas draw={draw} height={height} width={width} />
          {closestPointIndex !== undefined ? (
            <ChartInfoPopup data={dataPoints[closestPointIndex]}>
              {children(values[closestPointIndex])}
            </ChartInfoPopup>
          ) : null}
        </div>
        {axisValuePositions.map((point, i) => (
          <AxisLabel
            chartHeight={height}
            key={point}
            label={axisLabels[i]}
            position={point}
          />
        ))}
      </div>
    </div>
  );
};

const AxisLabel: React.FunctionComponent<{
  position: number;
  label: number;
  chartHeight: number;
}> = ({ position, label, chartHeight }) => {
  const ref = useRef<HTMLDivElement>(null);
  const divHeight = ref.current?.getBoundingClientRect().height ?? 16;
  const divPosition = chartHeight - position - divHeight / 2;

  return (
    <div
      className="absolute text-xs text-gray-400"
      ref={ref}
      style={{ left: 0, top: `${divPosition}px` }}
    >
      ${label / 1000}K
    </div>
  );
};

const ChartInfoPopup: React.FunctionComponent<{
  data: DataPoint;
  children: React.ReactNode;
}> = ({ data, children }) => {
  const ref = useRef<HTMLDivElement>(null);

  const rect = ref.current?.getBoundingClientRect();
  const centeredXPosition = data[0] - (rect?.width ?? 0) / 2;
  return (
    <div
      className="absolute"
      ref={ref}
      style={{ left: `${centeredXPosition}px`, top: `0px` }}
    >
      <div className="bg-white border border-gray-200 rounded-xl shadow dark:bg-gray-800 dark:border-gray-700 p-2">
        {children}
      </div>
    </div>
  );
};

const _dataPoints: DataPoint[] = [
  [1, 3500],
  [2, 6700],
  [3, 500],
  [4, 18768],
  [5, 10100],
  [6, 19000],
  [7, 20000],
  [8, 17500],
  [9, 1000],
  [10, -4000],
  [11, -1200],
  [12, -3000],
  [13, 1500],
];
export const LineChartExample: React.FunctionComponent = () => {
  const dataValues: GraphValue[] = _dataPoints.map(([_, value]) => ({
    value,
    fill: value > 0 ? colors.primary.DEFAULT : colors.red[500],
  }));

  return (
    <LineChart
      axisLabels={[40000, 20000, 0, -5000]}
      height={150}
      spacing={40}
      values={dataValues}
      width={600}
    >
      {({ value }) => (
        <div>
          <div className="text-sm text-center text-gray-600">
            Projected Balance
          </div>
          <div
            className={`text-sm ${value > 0 ? "text-primary" : "text-red-500"}`}
          >
            {formatDollarAmount(value)}
          </div>
        </div>
      )}
    </LineChart>
  );
};
