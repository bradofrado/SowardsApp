"use client";

import {
  useCategoryTotals,
  useTransactionCategoryTotals,
} from "../../hooks/category-totals";
import { Button } from "ui/src/components/catalyst/button";
import React, { useMemo, useState } from "react";
import {
  formatDollarAmount,
  getEndOfMonthDate,
  getStartOfMonthDate,
  isDateInBetween,
} from "model/src/utils";
import { Heading } from "ui/src/components/catalyst/heading";
import { FormDivider } from "ui/src/components/catalyst/form/form";
import { Month, months } from "./types";
import { useTransactions } from "../providers/transaction-provider";
import { BudgetItem, CategoryBudget } from "model/src/budget";
import { TargetBar } from "ui/src/components/feature/reporting/graphs/targetbar";
import { GraphValue } from "ui/src/components/feature/reporting/graphs/types";
import { useQueryState } from "ui/src/hooks/query-state";
import { Header } from "ui/src/components/core/header";
import { calculateAmount } from "../../utils";
import { useExpenses } from "../../hooks/expenses";
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
  const [currentMonth, setCurrentMonth] = useQueryState<Month>({
    defaultValue: months[new Date().getMonth()],
    key: "month",
  });
  const [currentYear, setCurrentYear] = useQueryState<number>({
    defaultValue: new Date().getFullYear(),
    key: "year",
  });
  const currentDate = useMemo(() => {
    const date = new Date();
    date.setMonth(months.indexOf(currentMonth));
    date.setFullYear(currentYear);
    return date;
  }, [currentMonth, currentYear]);
  const years = useMemo(
    () => Array.from(new Set(transactions.map((t) => t.date.getFullYear()))),
    [transactions],
  );
  const filteredTransactions = useMemo(
    () =>
      transactions.filter(
        (transaction) =>
          transaction.date.getMonth() === months.indexOf(currentMonth) &&
          transaction.date.getFullYear() === currentYear,
      ),
    [transactions, currentMonth, currentYear],
  );
  const { longTermExpenses, shortTermExpenses } = useExpenses({
    budgetItems,
    transactions,
    date: currentDate,
  });
  const longTermBudgeted = useMemo(
    () => calculateAmount(longTermExpenses),
    [longTermExpenses],
  );
  const longTermActual = useMemo(
    () =>
      longTermExpenses.reduce(
        (prev, curr) => prev + calculateAmount(curr.transactions),
        0,
      ),
    [longTermExpenses],
  );
  const shortTermBudgeted = useMemo(
    () => calculateAmount(shortTermExpenses),
    [shortTermExpenses],
  );
  const shortTermActual = useMemo(
    () =>
      shortTermExpenses.reduce(
        (prev, curr) => prev + calculateAmount(curr.transactions),
        0,
      ),
    [shortTermExpenses],
  );
  const shortTermChartData: CategoryChartData[] = useMemo(
    () =>
      shortTermExpenses.map(({ category, amount, transactions }) => ({
        category,
        actual: calculateAmount(transactions),
        budgeted: amount,
      })),
    [shortTermExpenses],
  );
  const longTermChartData: CategoryChartData[] = useMemo(
    () =>
      longTermExpenses.map(({ category, amount, transactions }) => {
        const currMonthTransactions = transactions.filter((t) =>
          isDateInBetween(
            t.date,
            getStartOfMonthDate(currentDate),
            getEndOfMonthDate(currentDate),
          ),
        );
        return {
          category,
          actual: calculateAmount(currMonthTransactions),
          budgeted:
            amount -
            calculateAmount(
              transactions.filter(
                (t) => t.date < getStartOfMonthDate(currentDate),
              ),
            ),
        };
      }),
    [longTermExpenses, currentDate],
  );
  const uncategorizedData = useMemo(() => {
    const uncategorizedTransactions = filteredTransactions.filter(
      (transaction) => transaction.transactionCategories.length === 0,
    );
    if (uncategorizedTransactions.length === 0) return undefined;
    const totalAmount = calculateAmount(uncategorizedTransactions);
    return {
      actual: totalAmount,
      budgeted: 0,
    };
  }, [filteredTransactions]);
  const onMonthClick = (month: Month) => {
    setCurrentMonth(month);
  };
  const onYearClick = (year: number) => {
    setCurrentYear(year);
  };
  return (
    <>
      <Heading>Spending by Category</Heading>
      <FormDivider />
      <div className="flex flex-col">
        {years.length > 1 ? (
          <div className="flex gap-2 flex-wrap">
            {years.map((year) => (
              <Button
                key={year}
                onClick={() => onYearClick(year)}
                plain={(year !== currentYear) as true}
              >
                {year}
              </Button>
            ))}
          </div>
        ) : null}
        <div className="flex gap-2 flex-wrap justify-between mt-2">
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
        <div className="space-y-2">
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
          </div>
          <Header level={4}>Monthly</Header>
          <div className="flex flex-col gap-2">
            <CategoryTarget
              data={{
                category: {
                  id: "shortTerm",
                  name: "Total Monthly Expenses",
                  type: "expense",
                  order: -2,
                },
                actual: shortTermActual,
                budgeted: shortTermBudgeted,
              }}
            />
            {shortTermChartData.map((data) => (
              <CategoryTarget key={data.category.id} data={data} />
            ))}
          </div>
          <Header level={4}>Long Term</Header>
          <div className="flex flex-col gap-2">
            <CategoryTarget
              data={{
                category: {
                  id: "longTerm",
                  name: "Total Long Term Expenses",
                  type: "expense",
                  order: -2,
                },
                actual: longTermActual,
                budgeted: longTermBudgeted,
              }}
            />
            {longTermChartData.map((data) => (
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
          {
            fill: "#fe502d",
            value: -left,
          },
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
