"use client";

import { Budget, CategoryBudget, SpendingRecord } from "model/src/budget";
import { CategoryNegativeChart } from "./charts/negative-chart";
import {
  useCategoryTotals,
  useTransactionCategoryTotals,
} from "../../utils/hooks/category-totals";
import { Button } from "ui/src/components/catalyst/button";
import { useMemo, useState } from "react";
import { isDateInBetween } from "model/src/utils";
import { Heading } from "ui/src/components/catalyst/heading";
import { FormDivider } from "ui/src/components/catalyst/form/form";
import { Month, months } from "./types";

interface CategoryMonthViewProps {
  categories: CategoryBudget[];
  transactions: SpendingRecord[];
  budget: Budget | undefined;
}
export const CategoryMonthView: React.FunctionComponent<
  CategoryMonthViewProps
> = ({ categories, transactions, budget }) => {
  const [currentMonth, setCurrentMonth] = useState<Month>(
    months[new Date().getMonth()],
  );

  const filterFunction = <
    T extends { amount: number } | { type: CategoryBudget["type"] },
  >(
    transaction: T,
  ) => {
    if ("amount" in transaction) {
      return transaction.amount > 0;
    }

    return transaction.type === "expense";
  };

  const filteredTransactions = useMemo(
    () =>
      transactions.filter(
        (transaction) =>
          transaction.date.getMonth() === months.indexOf(currentMonth) &&
          filterFunction(transaction),
      ),
    [transactions, currentMonth],
  );
  const filteredBudgeted = useMemo(
    () =>
      budget?.items.filter((item) => {
        const date = new Date();
        date.setMonth(months.indexOf(currentMonth));

        return (
          filterFunction(item) &&
          isDateInBetween(date, item.startDate, item.endDate)
        );
      }) ?? [],
    [budget, currentMonth],
  );
  const filteredCategories = useMemo(
    () => categories.filter((category) => filterFunction(category)),
    [categories],
  );

  const totalsActual = useTransactionCategoryTotals({
    transactions: filteredTransactions,
    categories: filteredCategories,
  });
  const totalsBudgeted = useCategoryTotals({
    transactions: filteredBudgeted,
    categories: filteredCategories,
  });

  const negativeChartData = useMemo(
    () =>
      totalsActual.map(({ category, totalAmount }) => ({
        category,
        actual: totalAmount,
        budgeted:
          totalsBudgeted.find(
            ({ category: budgetCategory }) => budgetCategory.id === category.id,
          )?.totalAmount || 0,
      })),
    [totalsActual, totalsBudgeted],
  );

  const uncategorizedData = useMemo(() => {
    const uncategorizedTransactions = filteredTransactions.filter(
      (transaction) => transaction.transactionCategories.length === 0,
    );

    if (uncategorizedTransactions.length === 0) return undefined;

    const totalAmount = uncategorizedTransactions.reduce(
      (prev, curr) => prev + curr.amount,
      0,
    );
    return {
      actual: totalAmount,
      budgeted: 0,
    };
  }, [filteredTransactions]);

  const onMonthClick = (month: Month) => {
    setCurrentMonth(month);
  };

  return (
    <>
      <Heading>Spending by Category</Heading>
      <FormDivider />
      <div className="flex flex-col">
        <div className="flex gap-2">
          {months.map((month) => (
            <Button
              key={month}
              onClick={() => onMonthClick(month)}
              plain={(month !== currentMonth) as true}
            >
              {month}
            </Button>
          ))}
        </div>
        <div className="h-[1000px]">
          <CategoryNegativeChart
            data={negativeChartData}
            uncategorizedData={uncategorizedData}
          />
        </div>
      </div>
    </>
  );
};
