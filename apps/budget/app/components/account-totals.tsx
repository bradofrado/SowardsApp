"use client";
import { Header } from "ui/src/components/core/header";
import { useAccounts } from "../../utils/components/account-provider";
import { AccountBase, AccountType } from "plaid";
import { datesEqual, day, formatDollarAmount } from "model/src/utils";
import { Card } from "ui/src/components/core/card";
import { AccountLineChart, TotalGraphValue } from "./charts/line-chart";
import { useMemo, useState } from "react";
import { useTransactions } from "../../utils/components/transaction-provider";
import { Button } from "ui/src/components/catalyst/button";
import { useQueryState } from "ui/src/hooks/query-state";

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
export const AccountTotals: React.FunctionComponent = () => {
  const [currDaysBack, setCurrDaysBack] = useQueryState({
    key: "netWorthFilter",
    defaultValue: 1,
  });

  const { netWorth, chartData, onValueChange } = useChartTotals(
    dateButtons[currDaysBack].daysBack,
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

interface AccountTotalsState {
  netWorth: number;
}
const useAccountTotals = (accounts: AccountBase[]): AccountTotalsState => {
  const netWorth = accounts.reduce<number>((prev, curr) => {
    return (
      prev +
      (curr.type === AccountType.Depository && curr.balances.current
        ? curr.balances.current
        : 0)
    );
  }, 0);
  return { netWorth };
};

const useChartTotals = (daysBack: number) => {
  const { accounts } = useAccounts();
  const { netWorth } = useAccountTotals(accounts);
  const [datePoint, setDatePoint] = useState<TotalGraphValue | undefined>(
    undefined,
  );
  const { expenses, income } = useTransactions();
  const incomeData: TotalGraphValue[] = useMemo(
    () =>
      Array.from(Array(daysBack).keys()).map((month, i) => {
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
    [expenses, income, daysBack],
  );
  const networthAccumulated = useMemo(
    () =>
      incomeData.reduce<TotalGraphValue[]>((acc, curr) => {
        const prev = acc[acc.length - 1]?.value ?? netWorth;
        return [...acc, { ...curr, value: prev - curr.value }];
      }, []),
    [incomeData, netWorth],
  );

  return {
    netWorth: datePoint?.value ?? netWorth,
    chartData: networthAccumulated.slice().reverse(),
    onValueChange: setDatePoint,
  };
};
