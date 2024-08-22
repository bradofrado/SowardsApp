"use client";

import {
  useCategoryTotals,
  useTransactionCategoryTotals,
} from "../../hooks/category-totals";
import { Button } from "ui/src/components/catalyst/button";
import { useMemo, useState } from "react";
import { isDateInBetween } from "model/src/utils";
import { Heading } from "ui/src/components/catalyst/heading";
import { FormDivider } from "ui/src/components/catalyst/form/form";
import { Month, months } from "./types";
import { useTransactions } from "../providers/transaction-provider";
import { CategoryNegativeChart } from "../charts/negative-chart";
import { BudgetItem } from "model/src/budget";

interface CategoryMonthViewProps {}
export const CategoryMonthView: React.FunctionComponent<
  CategoryMonthViewProps
> = () => {
  const {
    expenses: { transactions, budgetItems, categories },
  } = useTransactions();
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
      budgetItems.reduce<BudgetItem[]>((prev, curr) => {
        if (curr.cadence.type === "weekly") {
          const amount = curr.amount * 4;
          return [...prev, { ...curr, amount }];
        }

        if (curr.cadence.type === "monthly") {
          const amount = curr.amount;
          return [...prev, { ...curr, amount }];
        }

        const date = new Date();
        if (curr.cadence.type === "yearly") {
          //7 - 3
          const dateDiff =
            date.getMonth() > curr.cadence.month
              ? 12 - date.getMonth() + curr.cadence.month
              : curr.cadence.month - date.getMonth();
          const amount = curr.amount / dateDiff;

          return [...prev, { ...curr, amount }];
        }

        const datDiff = 11 - date.getMonth();
        const amount = curr.amount / datDiff;

        return [...prev, { ...curr, amount }];
      }, []),
    [budgetItems],
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
        <div className="flex gap-2 flex-wrap justify-between">
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
        <div>
          <CategoryNegativeChart
            data={negativeChartData}
            uncategorizedData={uncategorizedData}
          />
        </div>
      </div>
    </>
  );
};
