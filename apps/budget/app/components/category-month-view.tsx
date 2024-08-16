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
  budget: Budget;
}
export const CategoryMonthView: React.FunctionComponent<
  CategoryMonthViewProps
> = ({ categories, transactions, budget }) => {
  const [currentMonth, setCurrentMonth] = useState<Month>(
    months[new Date().getMonth()],
  );

  const filteredTransactions = useMemo(
    () =>
      transactions.filter(
        (transaction) =>
          transaction.date.getMonth() === months.indexOf(currentMonth),
      ),
    [transactions, currentMonth],
  );
  const filteredBudgeted = useMemo(
    () =>
      budget.items.filter((item) => {
        const date = new Date();
        date.setMonth(months.indexOf(currentMonth));

        return isDateInBetween(date, item.startDate, item.endDate);
      }),
    [budget, currentMonth],
  );

  const totalsActual = useTransactionCategoryTotals({
    transactions: filteredTransactions,
    categories,
  });
  const totalsBudgeted = useCategoryTotals({
    transactions: filteredBudgeted,
    categories,
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
          <CategoryNegativeChart data={negativeChartData} />
        </div>
      </div>
    </>
  );
};
