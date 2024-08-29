"use client";

import {
  useCategoryTotals,
  useTransactionCategoryTotals,
} from "../../hooks/category-totals";
import { Button } from "ui/src/components/catalyst/button";
import React, { useMemo, useState } from "react";
import { formatDollarAmount, isDateInBetween } from "model/src/utils";
import { Heading } from "ui/src/components/catalyst/heading";
import { FormDivider } from "ui/src/components/catalyst/form/form";
import { Month, months } from "./types";
import { useTransactions } from "../providers/transaction-provider";
import { BudgetItem, CategoryBudget } from "model/src/budget";
import { TargetBar } from "ui/src/components/feature/reporting/graphs/targetbar";
import { GraphValue } from "ui/src/components/feature/reporting/graphs/types";

interface CategoryChartData {
  category: CategoryBudget;
  actual: number;
  budgeted: number;
}
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
        const amount = curr.amount;

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

  const negativeChartData: CategoryChartData[] = useMemo(
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
          <div className="flex flex-col gap-2">
            {uncategorizedData ? (
              <CategoryTarget
                data={{
                  category: {
                    id: "uncategorized",
                    name: "Uncategorized",
                    type: "expense",
                    order: -1,
                  },
                  actual: uncategorizedData.actual || 0,
                  budgeted: uncategorizedData.actual || 0,
                }}
                defaultLabel={formatDollarAmount(uncategorizedData.actual)}
              />
            ) : null}
            {negativeChartData.map((data) => (
              <CategoryTarget key={data.category.id} data={data} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

const CategoryTarget: React.FunctionComponent<{
  data: CategoryChartData;
  defaultLabel?: string;
}> = ({ data, defaultLabel }) => {
  const left = data.budgeted - data.actual;
  const values: GraphValue[] =
    left > 0
      ? [
          {
            fill: "#7ed957",
            value: data.actual,
            label: formatDollarAmount(data.actual),
          },
        ]
      : [
          {
            fill: "#7ed957",
            value: data.budgeted,
            label: formatDollarAmount(data.actual),
          },
          { fill: "#fe502d", value: -left },
        ];

  const label =
    left > 0 ? (
      <div>
        <span className="text-sm">left to spend </span>
        {formatDollarAmount(left)}{" "}
      </div>
    ) : (
      <div>
        <span className="text-sm">over budget </span>
        <span className="text-red-400">{formatDollarAmount(-left)}</span>
      </div>
    );
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between">
        <div>{data.category.name}</div>
        {defaultLabel ?? label}
      </div>
      <TargetBar
        className="w-full"
        values={values}
        target={data.budgeted}
        total={data.budgeted * 1.25}
        totalLabel={`Total: ${formatDollarAmount(data.budgeted)}`}
      />
    </div>
  );
};
