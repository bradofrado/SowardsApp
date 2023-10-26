import { useRef, useEffect, useState, useMemo, useCallback } from "react"
import { formatDollarAmount } from "model/src/utils";
import type { PropsOf } from "../../../../types/polymorphics";
import type { GraphValue } from "./types";

type DataPoint = [number, number];
const dataPoints: DataPoint[] = [[1, 3500], [2, 6700], [3, 500], [4, 18768], [5, 10100], [6, 19000], [7, 20000], [8, 17500], [9, 1000], [10, -4000], [11, -1200], [12, -3000], [13, 1500]];

type CanvasProps = PropsOf<'canvas'> & {
	draw: (context: CanvasRenderingContext2D, frameCount: number) => void
}
const Canvas: React.FunctionComponent<CanvasProps> = ({draw, ...rest}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')

		if (!context) return;

    let frameCount = 0
    let animationFrameId: number;
    
    //Our draw came here
    const render = (): void => {
      frameCount++
      draw(context, frameCount)
      animationFrameId = window.requestAnimationFrame(render)
    }
    render()
    
    return () => {
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [draw])
  
  return (
		<canvas ref={canvasRef} {...rest}/>
	); 
}

export interface LineChartProps {
	values: GraphValue[],
	axisLabels: number[],
	popupContent: (value: number, index: number) => React.ReactNode,
	width: number,
	height: number,
	spacing?: number
}
export const LineChart: React.FunctionComponent<LineChartProps> = ({values, axisLabels, popupContent, width, height, spacing=30}) => {
	const [hoverPosition, setHoverPosition] = useState<DataPoint | undefined>();
	const [closestPoint, setClosestPoint] = useState<[DataPoint, number] | undefined>();
	const _data = useMemo<DataPoint[]>(() => [...axisLabels.map<DataPoint>(label => [0, label]), ...values.map<DataPoint>(({value}, i) => [i + 1, value])], [values, axisLabels])
	const normalizedPoints = useMemo<DataPoint[]>(() => {
		const getNormalizerAndMin = (index: 0 | 1, data: DataPoint[], size: DataPoint): DataPoint => {
			const sorted = data.slice().sort((a, b) => a[index] - b[index]);
			const max = sorted[sorted.length - 1];
			const min = sorted[0];
			const normalizer = (max[index] - min[index]) / size[index];	
		
			return [normalizer, min[index] / normalizer];
		}
		//Put things in an array so it is consistent with the points also being in an array
		const size: DataPoint = [width, height];

		const normalizerX = [1/spacing, 0]//getNormalizerAndMin(0, data, size);
		const normalizerY = getNormalizerAndMin(1, _data, size);

		return _data.map(([x, y]) => [(x / normalizerX[0]) - normalizerX[1], (y / normalizerY[0]) - normalizerY[1]]);
	}, [_data, width, height, spacing]);

	useEffect(() => {
		if (hoverPosition) {
			const [_, _1, _2, _3, ...data] = normalizedPoints;
			const _closestPointIndex = findClosestPoint(hoverPosition, data);
			const _closestPoint: [DataPoint, number] = [data[_closestPointIndex], _closestPointIndex];
			setClosestPoint(_closestPoint);
		} else {
			setClosestPoint(undefined);
		}
	}, [hoverPosition, normalizedPoints])

	const findClosestPoint = (point: DataPoint, data: DataPoint[]): number => {
		const sortedPoints = data.map(([x], index) => ({index, distance: Math.abs(point[0] - x)})).sort((a, b) => a.distance - b.distance);

		return sortedPoints[0].index;
	}

	const draw = useCallback((ctx: CanvasRenderingContext2D): void => {
		const drawPoints = (data: DataPoint[]): void => {
			const _height = ctx.canvas.height;
		
			ctx.setLineDash([]);
			ctx.lineWidth = 2;
			let last: DataPoint = [0, _height];
			for (let i = 0; i < data.length; i++) {
				const [x, y] = data[i];
				ctx.beginPath();
				ctx.moveTo(...last);
				ctx.strokeStyle = values[i].fill;
				ctx.lineTo(x, _height - y);
				last = [x, _height - y];
				ctx.stroke();
			}
			
		
			ctx.fillStyle = '#fff';
			ctx.lineWidth = 4;
			for (let i = 0; i < data.length; i++) {
				const [x, y] = data[i];
				ctx.beginPath();
				ctx.arc(x, _height-y, 2, 0, 2*Math.PI);
				ctx.strokeStyle = values[i].fill;
				ctx.stroke();
				ctx.fill();	
			}
		}
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
		ctx.fillStyle = '#000000'

		const [l1, l2, l3, l4, ...data] = normalizedPoints;
		
		if (hoverPosition && closestPoint) {
			ctx.beginPath();
			ctx.lineWidth = 1;
			ctx.strokeStyle = values[closestPoint[1]].fill;
			ctx.setLineDash([]);
			ctx.moveTo(closestPoint[0][0], 0);
			
			ctx.lineTo(closestPoint[0][0], ctx.canvas.height);
			ctx.stroke();
		} 

		//Draw axis labels
		ctx.beginPath();
		ctx.setLineDash([2]);
		ctx.strokeStyle = '#d1d5db';
		ctx.lineWidth = 1;
		ctx.moveTo(l1[0], ctx.canvas.height - l1[1]);
		ctx.lineTo(ctx.canvas.width, ctx.canvas.height - l1[1]);
		ctx.moveTo(l2[0], ctx.canvas.height - l2[1]);
		ctx.lineTo(ctx.canvas.width, ctx.canvas.height - l2[1]);
		ctx.moveTo(l3[0], ctx.canvas.height - l3[1]);
		ctx.lineTo(ctx.canvas.width, ctx.canvas.height - l3[1]);
		ctx.moveTo(l4[0], ctx.canvas.height - l4[1]);
		ctx.lineTo(ctx.canvas.width, ctx.canvas.height - l4[1]);
		ctx.stroke();

		drawPoints(data);
	}, [closestPoint, hoverPosition, normalizedPoints, values]);

	const onMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
		const rect = e.currentTarget.getBoundingClientRect();
		setHoverPosition([e.clientX - (rect.left), e.clientY - rect.top]);
	}

	const onMouseLeave: React.MouseEventHandler<HTMLDivElement> = () => {
		setHoverPosition(undefined);
	}
	return (
		<div className="relative">
			<div className="absolute left-10" onMouseLeave={onMouseLeave} onMouseMove={onMouseMove}>
				<Canvas className="" draw={draw}  height={height} width={width}/>
				{closestPoint ? <ChartInfoPopup data={closestPoint[0]}>{popupContent(_data[closestPoint[1] + 4][1], closestPoint[1])}</ChartInfoPopup> : null}
			</div>
			{normalizedPoints.slice(0, 4).map((point, i) => <div className="absolute text-xs text-gray-400" key={point[1]} style={{left: 0, top: `${height - point[1] - 8}px`}}>${_data[i][1]/1000}K</div>)}
		</div>
	)
}

const ChartInfoPopup: React.FunctionComponent<{data: DataPoint, children: React.ReactNode}> = ({data, children}) => {
	const ref = useRef<HTMLDivElement>(null);
	
	const rect = ref.current?.getBoundingClientRect();
	return (
		<div className="absolute" ref={ref} style={{left: `${data[0] - ((rect?.width ?? 0) / 2)}px`, top: `0px`}}>
			<div className="bg-white border border-gray-200 rounded-xl shadow dark:bg-gray-800 dark:border-gray-700 p-2">
				{children}
			</div>
		</div>
	)
}

export const LineChartExample: React.FunctionComponent = () => {
	const popupContent = (value: number): React.ReactNode => {
		return (
			<div>
				<div className="text-sm text-center text-gray-600">Projected Balance</div>
				<div className={`text-sm ${value > 0 ? 'text-primary' : 'text-red-500'}`}>{formatDollarAmount(value)}</div>
			</div>
		)
	}

	const dataValues: GraphValue[] = dataPoints.map(([_, value]) => ({value, fill: value > 0 ? '#379BDA' : '#ef4444'}))
	return (
		<LineChart axisLabels={[40000, 20000, 0, -5000]} height={150} popupContent={popupContent} spacing={40} values={dataValues} width={600}/>
	)
}