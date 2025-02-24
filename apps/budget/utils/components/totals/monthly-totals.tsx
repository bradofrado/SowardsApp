import { FC, useMemo } from "react";
import { useTransactions } from "../providers/transaction-provider";
import {
  CategoryBudget,
  SpendingRecord,
  TransactionCategory,
} from "model/src/budget";
import { differenceInDays } from "date-fns";
import { calculateAmount } from "@/utils/utils";
import { round } from "model/src/utils";

export const MonthlyTotals: FC = () => {
  const categoryTotals = useMonthlyTotals();

  return (
    <div className="space-y-2">
      {categoryTotals.map(({ category, total }) => (
        <div className="flex p-4 border rounded-md justify-between">
          <div>{category.name}</div>
          <div>{total}</div>
        </div>
      ))}
    </div>
  );
};

export const useMonthlyTotals = () => {
  const { transactions } = useTransactions();
  const categories = useMemo(() => {
    return transactions
      .flat()
      .reduce<(CategoryBudget & { transactions: SpendingRecord[] })[]>(
        (prev, curr) => {
          const existing = prev.find(
            (c) => c.id === curr.transactionCategories[0]?.category.id,
          );
          if (existing) {
            existing.transactions.push(curr);
            return prev;
          }
          const newItem = curr.transactionCategories[0]?.category
            ? {
                ...curr.transactionCategories[0]?.category,
                transactions: [curr],
              }
            : undefined;
          if (!newItem) {
            return prev;
          }

          return [...prev, newItem];
        },
        [],
      );
  }, [transactions]);

  const categoryTotals = useMemo(() => {
    return categories.map((category) => {
      const minDate = new Date(
        Math.min(...category.transactions.map((t) => t.date.getTime())),
      );
      const maxDate = new Date(
        Math.max(...category.transactions.map((t) => t.date.getTime())),
      );
      const monthsInBetween = differenceInDays(maxDate, minDate) / 30;
      return {
        category,
        total:
          round(Math.abs(calculateAmount(category.transactions)), 2) /
          monthsInBetween,
      };
    });
  }, [categories]);

  return categoryTotals;
};
