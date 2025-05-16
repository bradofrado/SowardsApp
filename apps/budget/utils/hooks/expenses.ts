import { SpendingRecordWithAccountType } from "api/src/services/budget";
import {
  BudgetCadence,
  BudgetCadenceType,
  budgetCadenceTypes,
  BudgetItem,
} from "model/src/budget";
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
}): Record<BudgetCadenceType, BudgetItemWithTransactions[]> => {
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
  const expensesByCadenceType = useMemo(() => {
    return Object.fromEntries(
      budgetCadenceTypes.map((cadenceType) => [
        cadenceType,
        createBudgetItemWithTransactions([cadenceType]),
      ]),
    ) as Record<BudgetCadenceType, BudgetItemWithTransactions[]>;
  }, [createBudgetItemWithTransactions]);
  return expensesByCadenceType;
};
