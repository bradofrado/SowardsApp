import { BudgetItem, SavingsGoal, SpendingRecord } from "model/src/budget";
import { datesEqual } from "model/src/utils";

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
