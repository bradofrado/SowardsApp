"use client";

import { Button } from "ui/src/components/catalyst/button";
import React, { useMemo, useState } from "react";
import {
  compare,
  displayDate,
  formatDollarAmount,
  getEndOfMonthDate,
  getStartOfMonthDate,
  isDateInBetween,
} from "model/src/utils";
import { Heading } from "ui/src/components/catalyst/heading";
import { FormDivider } from "ui/src/components/catalyst/form/form";
import { Month, months } from "./types";
import { useTransactions } from "../providers/transaction-provider";
import { CategoryBudget } from "model/src/budget";
import { TargetBar } from "ui/src/components/feature/reporting/graphs/targetbar";
import { GraphValue } from "ui/src/components/feature/reporting/graphs/types";
import { useQueryState } from "ui/src/hooks/query-state";
import { Header } from "ui/src/components/core/header";
import { calculateAmount } from "../../utils";
import { useExpenses } from "../../hooks/expenses";
import { SpendingRecordWithAccountType } from "api/src/services/budget";
import {
  Dialog,
  DialogBody,
  DialogTitle,
} from "ui/src/components/catalyst/dialog";
import { useDateState } from "../../hooks/date-state";
interface CategoryChartData {
  category: CategoryBudget;
  actual: number;
  budgeted: number;
  transactions: SpendingRecordWithAccountType[];
}
interface CategoryMonthViewProps {}
export const CategoryMonthView: React.FunctionComponent<
  CategoryMonthViewProps
> = () => {
  const {
    expenses: { budgetItems, transactions },
  } = useTransactions();
  const {
    currentMonth,
    currentYear,
    setCurrentMonth,
    setCurrentYear,
    currentDate,
  } = useDateState();

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
        transactions,
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
        console.log(category.name);
        console.log(
          transactions.filter((t) => t.date < getStartOfMonthDate(currentDate))
            .length,
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
          transactions: currMonthTransactions,
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
      transactions: uncategorizedTransactions,
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
                  transactions: uncategorizedData.transactions,
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
                transactions: shortTermExpenses.reduce<
                  SpendingRecordWithAccountType[]
                >((prev, curr) => prev.concat(...curr.transactions), []),
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
                transactions: longTermExpenses.reduce<
                  SpendingRecordWithAccountType[]
                >((prev, curr) => prev.concat(...curr.transactions), []),
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
  const [isOpen, setIsOpen] = useState(false);
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
    <>
      <button
        className="flex flex-col gap-2 p-2 hover:bg-gray-100 rounded-md"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex justify-between w-full">
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
      </button>
      <CategoryTransactionsModal
        data={data}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};

interface CategoryTransactionsModalProps {
  data: CategoryChartData;
  isOpen: boolean;
  onClose: () => void;
}
const CategoryTransactionsModal: React.FunctionComponent<
  CategoryTransactionsModalProps
> = ({ isOpen, onClose, data: { transactions, budgeted, actual } }) => {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>Transactions</DialogTitle>
      <DialogBody>
        <div className="grid grid-cols-2 mb-4">
          <div>Budget</div>

          <span>{formatDollarAmount(budgeted)}</span>
          <div>Actual</div>
          <span>{formatDollarAmount(actual)}</span>
        </div>
        <div className="flex flex-col gap-2 max-h-96 overflow-auto">
          {transactions
            .slice()
            .sort((a, b) => compare(b.date.getTime(), a.date.getTime()))
            .map((transaction) => (
              <div
                key={transaction.transactionId}
                className="flex flex-row justify-between w-full border p-3 rounded-md"
              >
                <div className="flex gap-4">
                  <div>{displayDate(transaction.date)}</div>
                  <span>{transaction.description}</span>
                </div>
                <span>{formatDollarAmount(transaction.amount)}</span>
              </div>
            ))}
        </div>
      </DialogBody>
    </Dialog>
  );
};
