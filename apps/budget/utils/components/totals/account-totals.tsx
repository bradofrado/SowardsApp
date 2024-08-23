"use client";
import { Header } from "ui/src/components/core/header";
import { useAccounts } from "../providers/account-provider";
import { AccountBase, AccountType } from "plaid";
import { datesEqual, day, formatDollarAmount } from "model/src/utils";
import { Card } from "ui/src/components/core/card";

import { useMemo, useState } from "react";
import { useTransactions } from "../providers/transaction-provider";
import { Button } from "ui/src/components/catalyst/button";
import { useQueryState } from "ui/src/hooks/query-state";
import { AccountLineChart, TotalGraphValue } from "../charts/line-chart";
import { useAccountTotals } from "../../hooks/account-totals";
import { useMonthlyAverage } from "./transaction-totals";
import { useChartTotals } from "./chart-totals";
import { SavingsAccount } from "../providers/types";
import { SpendingRecord } from "model/src/budget";

const dateButtons: {
  label: string;
  daysBack: number;
}[] = [
  {
    label: "1M",
    daysBack: 30,
  },
  {
    label: "3M",
    daysBack: 90,
  },
  {
    label: "6M",
    daysBack: 180,
  },
  {
    label: "1Y",
    daysBack: 365,
  },
];
export const AccountTotals: React.FunctionComponent<{ future?: boolean }> = ({
  future = false,
}) => {
  const { savingsAccounts } = useAccounts();
  const [currDaysBack, setCurrDaysBack] = useQueryState({
    key: "netWorthFilter",
    defaultValue: 1,
  });
  const [currAccount, setCurrAccount] = useQueryState<string>({
    key: "account",
    defaultValue: "Net Worth",
  });

  const daysBack = useMemo(
    () => dateButtons[currDaysBack].daysBack,
    [currDaysBack],
  );

  const { amount, chartData, onValueChange } = useAccountChartTotals(
    daysBack,
    future,
    currAccount,
  );

  return (
    <Card className="flex-1" label={currAccount}>
      <AmountHeaderLabel amount={amount} />
      <div className="mt-4">
        <AccountLineChart chartData={chartData} onValueChange={onValueChange} />
        <div className="flex gap-4">
          {dateButtons.map(({ label, daysBack }, i) => (
            <Button
              key={label}
              plain={(currDaysBack !== i) as true}
              onClick={() => setCurrDaysBack(i)}
            >
              {label}
            </Button>
          ))}
        </div>
        {savingsAccounts.length > 0 ? (
          <div className="flex gap-4 mt-2">
            {["Net Worth", ...savingsAccounts.map((a) => a.name)].map(
              (name, i) => (
                <Button
                  key={name}
                  plain={(currAccount !== name) as true}
                  onClick={() => setCurrAccount(name)}
                >
                  {name}
                </Button>
              ),
            )}
          </div>
        ) : null}
      </div>
    </Card>
  );
};

const AmountHeaderLabel: React.FunctionComponent<{ amount: number }> = ({
  amount,
}) => {
  const formattedAmount = formatDollarAmount(amount);
  const dollarsAmount = formattedAmount.split(".")[0];
  const centsAmount = formattedAmount.split(".")[1];
  return (
    <div className="flex">
      <Header level={1}>{dollarsAmount}</Header>
      <Header className="!leading-5" level={3}>
        .{centsAmount}
      </Header>
    </div>
  );
};

const useAccountChartTotals = (
  daysBack: number,
  future: boolean,
  account: string,
) => {
  const { savingsAccounts } = useAccounts();
  const { netWorth, chartData, onValueChange } = useNetWorthChartTotals(
    daysBack,
    future,
  );
  const {
    amount: savingsAmount,
    chartData: savingsChartData,
    onValueChange: onSavingsValueChange,
  } = useSavingAccountTotals(
    daysBack,
    savingsAccounts.find((a) => a.name === account),
    future,
  );

  if (account === "Net Worth") {
    return {
      amount: netWorth,
      chartData,
      onValueChange,
    };
  }

  return {
    amount: savingsAmount,
    chartData: savingsChartData,
    onValueChange: onSavingsValueChange,
  };
};

const useNetWorthChartTotals = (daysBack: number, future: boolean) => {
  const { accounts } = useAccounts();
  const { netWorth } = useAccountTotals(accounts);

  const { expenses, income } = useTransactions();
  const { avgMonthlyExpense, avgMonthlyIncome } = useMonthlyAverage();

  const options = useChartTotals({
    presentAmount: netWorth,
    numDays: daysBack,
    isFuture: future,
    amountDateCallback: (date) => {
      const expenseOnDate = transactionsOnDate(expenses.transactions, date);
      const incomeOnDate = transactionsOnDate(income.transactions, date);

      const expenseTotal = calculateAmount(expenseOnDate);

      const incomeTotal = calculateAmount(incomeOnDate);

      return incomeTotal - expenseTotal;
    },
    futureAmountDateCallback: () =>
      avgMonthlyIncome / 30 - avgMonthlyExpense / 30,
  });

  return {
    netWorth: options.amount,
    chartData: options.chartData,
    onValueChange: options.onValueChange,
  };
};

const useSavingAccountTotals = (
  daysBack: number,
  savingsAccount: SavingsAccount | undefined,
  isFuture: boolean,
) => {
  const options = useChartTotals({
    numDays: daysBack,
    isFuture,
    amountDateCallback: (date) =>
      calculateAmount(
        transactionsOnDate(savingsAccount?.transactions ?? [], date),
      ),
    futureAmountDateCallback: () =>
      savingsAccount?.monthlyContribution ?? 0 / 30,
  });
  return options;
};

function transactionsOnDate(transactions: SpendingRecord[], date: Date) {
  return transactions.filter((transaction) =>
    datesEqual(transaction.date, date),
  );
}

function calculateAmount<T extends { amount: number }>(transactions: T[]) {
  return transactions.reduce((prev, curr) => prev + curr.amount, 0);
}
