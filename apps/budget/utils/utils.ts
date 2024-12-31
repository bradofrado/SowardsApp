import { SpendingRecord } from "model/src/budget";
import { datesEqual } from "model/src/utils";

export function transactionsOnDate(transactions: SpendingRecord[], date: Date) {
  return transactions.filter((transaction) =>
    datesEqual(transaction.date, date),
  );
}

export function calculateAmount<T extends { amount: number }>(
  transactions: T[],
);
export function calculateAmount<
  T extends { [k in K]: number },
  K extends string,
>(transactions: T[], key: K);
export function calculateAmount<
  T extends { [k in K]: number },
  K extends string = "amount",
>(transactions: T[], key?: K) {
  return transactions.reduce(
    (prev, curr) => prev + curr[key || ("amount" as K)],
    0,
  );
}
