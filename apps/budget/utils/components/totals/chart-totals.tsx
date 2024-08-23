import { useMemo, useState } from "react";
import { TotalGraphValue } from "../charts/line-chart";
import { day } from "model/src/utils";

export interface Options {
  //Used if the present amount is known. Otherwise it will be calculated
  presentAmount?: number;
  numDays: number;
  isFuture: boolean;
  amountDateCallback: (date: Date) => number;
  futureAmountDateCallback: (date: Date) => number;
}
export const useChartTotals = ({
  numDays,
  isFuture,
  amountDateCallback,
  futureAmountDateCallback,
  presentAmount,
}: Options) => {
  const [datePoint, setDatePoint] = useState<TotalGraphValue | undefined>(
    undefined,
  );

  const accumulateBackwards = (
    transactions: TotalGraphValue[],
    startAmount: number,
  ) => {
    return transactions.reduce<TotalGraphValue[]>((acc, curr) => {
      const prev = acc[acc.length - 1]?.value ?? startAmount;
      return [...acc, { ...curr, value: prev - curr.value }];
    }, []);
  };

  const accumulateForwards = (
    transactions: TotalGraphValue[],
    startAmount: number,
  ) => {
    return transactions.reduce<TotalGraphValue[]>((acc, curr) => {
      const prev = acc[acc.length - 1]?.value ?? startAmount;
      return [...acc, { ...curr, value: prev + curr.value }];
    }, []);
  };

  const previousData: TotalGraphValue[] = useMemo(
    () =>
      Array.from(Array(isFuture ? 30 : numDays).keys()).map((month, i) => {
        const date = new Date(new Date().getTime() - i * day);
        const amount = amountDateCallback(date);

        return {
          value: amount,
          date,
          fill: "#8c52ff",
        };
      }),
    [numDays, isFuture, amountDateCallback],
  );

  const futureData: TotalGraphValue[] = useMemo(
    () =>
      Array.from(Array(numDays).keys()).map((month, i) => {
        const date = new Date(new Date().getTime() + i * day);

        const amount = futureAmountDateCallback(date);

        return {
          value: amount,
          date,
          fill: "#41b8d5",
        };
      }),
    [futureAmountDateCallback, numDays],
  );

  const networthPrevious = useMemo(
    () =>
      presentAmount !== undefined
        ? accumulateBackwards(previousData, presentAmount).reverse()
        : accumulateForwards(previousData.slice().reverse(), 0),
    [previousData, presentAmount],
  );

  const networthFuture = useMemo(
    () => accumulateForwards(futureData, presentAmount ?? 0),
    [futureData, presentAmount],
  );

  const presentAmountCalculated = useMemo(
    () =>
      presentAmount ??
      networthPrevious[networthPrevious.length - 1]?.value ??
      0,
    [presentAmount, networthPrevious],
  );

  return {
    amount: datePoint?.value ?? presentAmountCalculated,
    chartData: [...networthPrevious, ...(isFuture ? networthFuture : [])],
    onValueChange: setDatePoint,
  };
};
