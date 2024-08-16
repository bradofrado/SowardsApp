import { CategoryBudget, SpendingRecord } from "model/src/budget";
import { useMemo } from "react";

interface CategoryTotalsOptions<
  T extends { amount: number; category: CategoryBudget },
> {
  transactions: T[];
  categories: CategoryBudget[];
}
export const useCategoryTotals = <
  T extends { amount: number; category: CategoryBudget },
>({
  transactions,
  categories,
}: CategoryTotalsOptions<T>) => {
  const totals = useMemo(
    () =>
      transactions.reduce<
        {
          id: number;
          name: string;
          category: CategoryBudget;
          totalAmount: number;
          amounts: number[];
        }[]
      >(
        (prev, curr, i) => {
          const category = curr.category.id;
          const categoryIndex = prev.findIndex(
            (item) => item.category.id === category,
          );
          const amount =
            curr.category.type === "expense" ? curr.amount : -curr.amount;
          if (categoryIndex > -1) {
            prev[categoryIndex].totalAmount += amount;
            prev[categoryIndex].amounts.push(amount);
            return prev;
          }
          return [
            ...prev,
            {
              name: curr.category.name,
              category: curr.category,
              totalAmount: amount,
              amounts: [amount],
              id: i,
            },
          ];
        },
        categories.map((category, i) => ({
          name: category.name,
          category,
          id: i,
          amounts: [],
          totalAmount: 0,
        })),
      ),
    [transactions, categories],
  );

  return totals;
};

export const useTransactionCategoryTotals = ({
  transactions,
  categories,
}: {
  transactions: SpendingRecord[];
  categories: CategoryBudget[];
}) => {
  return useCategoryTotals({
    transactions: transactions.reduce(
      (prev, curr) => [...prev, ...curr.transactionCategories],
      [],
    ),
    categories,
  });
};
