import { FC, useMemo } from "react";
import { useTransactions } from "../providers/transaction-provider";
import {
  CategoryBudget,
  SpendingRecord,
  TransactionCategory,
} from "model/src/budget";
import { differenceInDays } from "date-fns";
import { calculateAmount } from "@/utils/utils";

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
      const monthsInBetween = differenceInDays(minDate, maxDate) / 30;
      return {
        category,
        total: calculateAmount(category.transactions) / monthsInBetween,
      };
    });
  }, [categories]);

  return categoryTotals;
};

const unique = <T,>(arr: T[], key: (item: T) => string): T[] => {
  return arr.reduce((acc, item) => {
    const k = key(item);
    if (acc.find((i) => key(i) === k)) {
      return acc;
    }
    return [...acc, item];
  }, []);
};
