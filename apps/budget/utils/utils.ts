import { BudgetItem, SavingsGoal, SpendingRecord } from "model/src/budget";
import { datesEqual } from "model/src/utils";

export const calculateCadenceMonthlyAmount = (
  item: BudgetItem | SavingsGoal,
): number => {
  if (!("cadence" in item)) {
    return item.amount;
  }

  if (item.cadence.type === "weekly") {
    const amount = item.amount * 4;
    return amount;
  }

  if (item.cadence.type === "monthly") {
    const amount = item.amount;
    return amount;
  }

  const date = new Date();
  if (item.cadence.type === "yearly") {
    //7 - 3
    const dateDiff =
      date.getMonth() > item.cadence.month
        ? 12 - date.getMonth() + item.cadence.month
        : item.cadence.month - date.getMonth();
    const amount = item.amount / dateDiff;

    return amount;
  }

  const datDiff = 11 - date.getMonth();
  const amount = item.amount / datDiff;

  return amount;
};

export function transactionsOnDate(transactions: SpendingRecord[], date: Date) {
  return transactions.filter((transaction) =>
    datesEqual(transaction.date, date),
  );
}

export function calculateAmount<T extends { amount: number }>(
  transactions: T[],
) {
  return transactions.reduce((prev, curr) => prev + curr.amount, 0);
}
