"use client";
import { Header } from "ui/src/components/core/header";
import { useAccounts } from "../providers/account-provider";
import { AccountBase, AccountType } from "plaid";
import { datesEqual, day, formatDollarAmount } from "model/src/utils";
import { Card } from "ui/src/components/core/card";

import { useMemo, useState } from "react";
import { useTransactions } from "../providers/transaction-provider";
import { Button } from "ui/src/components/catalyst/button";
import { useQueryState } from "ui/src/hooks/query-state";
import { AccountLineChart, TotalGraphValue } from "../charts/line-chart";
import { useAccountTotals } from "../../hooks/account-totals";
import { useMonthlyAverage } from "./transaction-totals";

const dateButtons: {
  label: string;
  daysBack: number;
}[] = [
  {
    label: "1M",
    daysBack: 30,
  },
  {
    label: "3M",
    daysBack: 90,
  },
  {
    label: "6M",
    daysBack: 180,
  },
  {
    label: "1Y",
    daysBack: 365,
  },
];
export const AccountTotals: React.FunctionComponent<{ future?: boolean }> = ({
  future = false,
}) => {
  const [currDaysBack, setCurrDaysBack] = useQueryState({
    key: "netWorthFilter",
    defaultValue: 1,
  });

  const { netWorth, chartData, onValueChange } = useChartTotals(
    dateButtons[currDaysBack].daysBack,
    future,
  );

  return (
    <Card className="flex-1" label="Net Worth">
      <AmountHeaderLabel amount={netWorth} />
      <div className="mt-4">
        <AccountLineChart chartData={chartData} onValueChange={onValueChange} />
        <div className="flex gap-4">
          {dateButtons.map(({ label, daysBack }, i) => (
            <Button
              key={label}
              plain={(currDaysBack !== i) as true}
              onClick={() => setCurrDaysBack(i)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
};

const AmountHeaderLabel: React.FunctionComponent<{ amount: number }> = ({
  amount,
}) => {
  const formattedAmount = formatDollarAmount(amount);
  const dollarsAmount = formattedAmount.split(".")[0];
  const centsAmount = formattedAmount.split(".")[1];
  return (
    <div className="flex">
      <Header level={1}>{dollarsAmount}</Header>
      <Header className="!leading-5" level={3}>
        .{centsAmount}
      </Header>
    </div>
  );
};

const useChartTotals = (daysBack: number, future: boolean) => {
  const { accounts } = useAccounts();
  const { netWorth } = useAccountTotals(accounts);
  const [datePoint, setDatePoint] = useState<TotalGraphValue | undefined>(
    undefined,
  );
  const { expenses, income } = useTransactions();
  const { avgMonthlyExpense, avgMonthlyIncome } = useMonthlyAverage();

  const previousData: TotalGraphValue[] = useMemo(
    () =>
      Array.from(Array(future ? 30 : daysBack).keys()).map((month, i) => {
        const date = new Date(new Date().getTime() - i * day);
        const expenseOnDate = expenses.transactions.filter((transaction) =>
          datesEqual(transaction.date, date),
        );
        const incomeOnDate = income.transactions.filter((transaction) =>
          datesEqual(transaction.date, date),
        );
        const expenseTotal = expenseOnDate.reduce(
          (prev, curr) => prev + curr.amount,
          0,
        );
        const incomeTotal = incomeOnDate.reduce(
          (prev, curr) => prev + curr.amount,
          0,
        );

        return {
          value: incomeTotal - expenseTotal,
          date,
          fill: "#8c52ff",
        };
      }),
    [daysBack, expenses.transactions, future, income.transactions],
  );

  const futureData: TotalGraphValue[] = useMemo(
    () =>
      Array.from(Array(daysBack).keys()).map((month, i) => {
        const date = new Date(new Date().getTime() + i * day);

        return {
          value: avgMonthlyIncome / 30 - avgMonthlyExpense / 30,
          date,
          fill: "#41b8d5",
        };
      }),
    [avgMonthlyExpense, avgMonthlyIncome, daysBack],
  );

  const networthPrevious = useMemo(
    () =>
      previousData.reduce<TotalGraphValue[]>((acc, curr) => {
        const prev = acc[acc.length - 1]?.value ?? netWorth;
        return [...acc, { ...curr, value: prev - curr.value }];
      }, []),
    [previousData, netWorth],
  );

  const networthFuture = useMemo(
    () =>
      futureData.reduce<TotalGraphValue[]>((acc, curr) => {
        const prev = acc[acc.length - 1]?.value ?? netWorth;
        return [...acc, { ...curr, value: prev + curr.value }];
      }, []),
    [futureData, netWorth],
  );

  return {
    netWorth: datePoint?.value ?? netWorth,
    chartData: [
      ...networthPrevious.slice().reverse(),
      ...(future ? networthFuture : []),
    ],
    onValueChange: setDatePoint,
  };
};
