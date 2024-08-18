"use client";
import { FormDivider } from "ui/src/components/catalyst/form/form";
import { Heading } from "ui/src/components/catalyst/heading";
import { useTransactions } from "../providers/transaction-provider";
import { TransactionBarChart } from "../charts/bar-chart";
import { useMemo } from "react";
import { day, formatDollarAmount } from "model/src/utils";
import { SpendingRecord } from "model/src/budget";

interface TransactionTotalsProps {
  type: "expense" | "income";
  label: string;
}
export const TransactionTotals: React.FunctionComponent<
  TransactionTotalsProps
> = ({ label }) => {
  const {
    expenses: { transactions: expenseTransactions },
    income: { transactions: incomeTransactions },
  } = useTransactions();
  const { avgMonthlyExpense, avgMonthlyIncome } = useMonthlyAverage();
  return (
    <>
      <Heading>
        <span className="text-muted-foreground">Avg. Income</span>{" "}
        {formatDollarAmount(avgMonthlyIncome)}
      </Heading>
      <Heading>
        <span className="text-muted-foreground">Avg. Spending</span>{" "}
        {formatDollarAmount(avgMonthlyExpense)}
      </Heading>
      <FormDivider />
      <TransactionBarChart
        bar1={incomeTransactions}
        bar2={expenseTransactions}
      />
    </>
  );
};

export const useMonthlyAverage = () => {
  const {
    expenses: { transactions: expenseTransactions },
    income: { transactions: incomeTransactions },
  } = useTransactions();
  const avgMonthlyExpense = useMemo(
    () => calculateAverageMonthly(expenseTransactions),
    [expenseTransactions],
  );
  const avgMonthlyIncome = useMemo(
    () => calculateAverageMonthly(incomeTransactions),
    [incomeTransactions],
  );

  return { avgMonthlyExpense, avgMonthlyIncome };
};

const calculateAverageMonthly = (transactions: SpendingRecord[]) => {
  const minDate = new Date(
    Math.min(...transactions.map((t) => t.date.getTime())),
  );
  const maxDate = new Date(
    Math.max(...transactions.map((t) => t.date.getTime())),
  );
  const daysInBetween = (maxDate.getTime() - minDate.getTime()) / day;
  const total = transactions.reduce((prev, curr) => prev + curr.amount, 0);

  return (total / daysInBetween) * 30;
};
