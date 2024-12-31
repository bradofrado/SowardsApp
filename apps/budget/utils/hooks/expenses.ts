import { SpendingRecordWithAccountType } from "api/src/services/budget";
import { BudgetItem } from "model/src/budget";
import { isDateInBetween } from "model/src/utils";
import { useMemo } from "react";

interface BudgetItemWithTransactions extends BudgetItem {
  transactions: SpendingRecordWithAccountType[];
}
export const useExpenses = ({
  budgetItems,
  transactions,
  date,
}: {
  budgetItems: BudgetItem[];
  transactions: SpendingRecordWithAccountType[];
  date: Date;
}): {
  longTermExpenses: BudgetItemWithTransactions[];
  shortTermExpenses: BudgetItemWithTransactions[];
} => {
  const longTermExpenses = useMemo(
    () =>
      budgetItems
        .filter(
          (expense) =>
            expense.cadence.type === "eventually" &&
            isDateInBetween(date, expense.periodStart, expense.periodEnd),
        )
        .map((expense) => ({
          ...expense,
          transactions: transactions.filter(
            (t) =>
              isDateInBetween(t.date, expense.periodStart, expense.periodEnd) &&
              t.transactionCategories[0]?.category.id === expense.category.id,
          ),
        })),
    [budgetItems, transactions, date],
  );
  const shortTermExpenses = useMemo(
    () =>
      budgetItems
        .filter(
          (expense) =>
            isDateInBetween(date, expense.periodStart, expense.periodEnd) &&
            expense.cadence.type === "monthly",
        )
        .map((expense) => ({
          ...expense,
          transactions: transactions.filter(
            (t) =>
              isDateInBetween(t.date, expense.periodStart, expense.periodEnd) &&
              t.transactionCategories[0]?.category.id === expense.category.id,
          ),
        })),
    [budgetItems, transactions, date],
  );
  return { longTermExpenses, shortTermExpenses };
};
