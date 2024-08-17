"use client";
import { FormDivider } from "ui/src/components/catalyst/form/form";
import { Heading } from "ui/src/components/catalyst/heading";
import { TransactionBarChart } from "./charts/bar-chart";
import { Budget, SpendingRecord } from "model/src/budget";
import { isDateInBetween } from "model/src/utils";
import { Month, months } from "./types";
import { useTransactions } from "../../utils/components/transaction-provider";

interface SpendingTotalsProps {}
export const SpendingTotals: React.FunctionComponent<
  SpendingTotalsProps
> = () => {
  const { transactions, budgetItems } = useTransactions();
  const data = months.map<{
    month: Month;
    actual: number;
    budget: number;
  }>((month) => {
    const date = new Date();
    date.setMonth(months.indexOf(month));
    return {
      month,
      actual: transactions.reduce<number>((prev, curr) => {
        return (
          prev +
          (curr.date.getMonth() === months.indexOf(month) && curr.amount > 0
            ? curr.amount
            : 0)
        );
      }, 0),
      budget: budgetItems.reduce<number>((prev, currItem) => {
        return (
          prev +
          (isDateInBetween(date, currItem.startDate, currItem.endDate)
            ? currItem.amount
            : 0)
        );
      }, 0),
    };
  });
  return (
    <>
      <Heading>Spending Totals</Heading>
      <FormDivider />
      <TransactionBarChart data={data} />
    </>
  );
};
