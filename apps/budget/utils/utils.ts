import { SpendingRecord } from "model/src/budget";
import { datesEqual, day } from "model/src/utils";

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

export const isTransferTransactionAndUpdateCache = (
  transaction: SpendingRecord,
  transferedCache: SpendingRecord[],
) => {
  //A transfer transaction is a transaction that has the reverse amount and is within 3 days of each other
  const transferTransactionIndex = transferedCache.findIndex(
    (a) =>
      Math.abs(a.date.getTime() - transaction.date.getTime()) <= 3 * day &&
      a.amount === -transaction.amount &&
      a.accountId !== transaction.accountId,
  );
  if (transferTransactionIndex > -1) {
    transferedCache.splice(transferTransactionIndex, 1);
    return true;
  }

  return false;
};
