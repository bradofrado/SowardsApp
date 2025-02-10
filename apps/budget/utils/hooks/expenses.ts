import { SpendingRecordWithAccountType } from "api/src/services/budget";
import { BudgetCadence, BudgetItem } from "model/src/budget";
import { isDateInBetween } from "model/src/utils";
import { useCallback, useMemo } from "react";

export interface BudgetItemWithTransactions extends BudgetItem {
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
  savingsGoals: BudgetItemWithTransactions[];
} => {
  const createBudgetItemWithTransactions = useCallback(
    (cadenceTypes: BudgetCadence["type"][]) => {
      return budgetItems
        .filter(
          (expense) =>
            cadenceTypes.includes(expense.cadence.type) &&
            isDateInBetween(date, expense.periodStart, expense.periodEnd),
        )
        .map((expense) => ({
          ...expense,
          transactions: transactions
            .filter(
              (t) =>
                isDateInBetween(
                  t.date,
                  expense.periodStart,
                  expense.periodEnd,
                ) &&
                t.transactionCategories.find(
                  (tc) => tc.category.id === expense.category.id,
                ),
            )
            .map((t) => ({
              ...t,
              amount:
                t.transactionCategories.find(
                  (tc) => tc.category.id === expense.category.id,
                )?.amount || t.amount,
            })),
        }));
    },
    [budgetItems, transactions, date],
  );
  const longTermExpenses = useMemo(
    () => createBudgetItemWithTransactions(["yearly", "eventually"]),
    [budgetItems, transactions, date],
  );
  const shortTermExpenses = useMemo(
    () => createBudgetItemWithTransactions(["monthly", "weekly"]),
    [budgetItems, transactions, date],
  );
  const savingsGoals = useMemo(
    () => createBudgetItemWithTransactions(["fixed"]),
    [budgetItems, transactions, date],
  );
  return { longTermExpenses, shortTermExpenses, savingsGoals };
};
