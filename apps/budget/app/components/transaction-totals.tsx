"use client";
import { FormDivider } from "ui/src/components/catalyst/form/form";
import { Heading } from "ui/src/components/catalyst/heading";
import { TransactionBarChart } from "./charts/bar-chart";
import { Budget, SpendingRecord } from "model/src/budget";
import { isDateInBetween } from "model/src/utils";
import { Month, months } from "./types";
import { useTransactions } from "../../utils/components/transaction-provider";

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
  return (
    <>
      <Heading>{label}</Heading>
      <FormDivider />
      <TransactionBarChart
        bar1={incomeTransactions}
        bar2={expenseTransactions}
      />
    </>
  );
};
