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
> = ({ type, label }) => {
  const {
    [type === "expense" ? "expenses" : "income"]: { transactions, budgetItems },
  } = useTransactions();
  return (
    <>
      <Heading>{label}</Heading>
      <FormDivider />
      <TransactionBarChart
        transactions={transactions}
        budgetItems={budgetItems}
        actualFill={type === "expense" ? "#41b8d5" : "#8c52ff"}
      />
    </>
  );
};
