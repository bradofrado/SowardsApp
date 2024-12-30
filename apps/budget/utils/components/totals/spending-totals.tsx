"use client";
import { useMemo } from "react";
import { useTransactions } from "../providers/transaction-provider";
import { ProgressBarMultiValue } from "ui/src/components/feature/reporting/graphs/progressbar-multivalue";
import { useAccountTotals } from "../../hooks/account-totals";
import { useAccounts } from "../providers/account-provider";
import { GraphValue } from "ui/src/components/feature/reporting/graphs/types";
import { calculateAmount } from "../../utils";
import { FormSection } from "ui/src/components/catalyst/form/form";
import { displayDate, formatDollarAmount } from "model/src/utils";
import { ChartLegend } from "ui/src/components/feature/reporting/graphs/chart-legend";
import { SavingsAccount } from "../providers/types";
import { HexColor } from "model/src/core/colors";
import { Header } from "ui/src/components/core/header";
import { AccountType } from "plaid";

export const SpendingTotals: React.FunctionComponent = () => {
  const { expenses } = useTransactions();
  const { accounts, savingsAccounts } = useAccounts();
  const { netWorth } = useAccountTotals(accounts);

  const longTermExpenses = useMemo(
    () =>
      expenses.budgetItems
        .filter((expense) => expense.cadence.type === "eventually")
        .map((expense) => ({
          ...expense,
          transactions: expenses.transactions.filter(
            (t) =>
              t.date.getMonth() === new Date().getMonth() &&
              t.transactionCategories[0]?.category.id === expense.category.id,
          ),
        })),
    [expenses],
  );
  const shortTermExpenses = useMemo(
    () =>
      expenses.budgetItems.filter(
        (expense) => expense.cadence.type === "monthly",
      ),
    [expenses],
  );
  const debt = useMemo(
    () => accounts.filter((account) => account.type === AccountType.Credit),
    [accounts],
  );
  const barValues: GraphValue[] = useMemo(
    () => [
      {
        value:
          calculateAmount(longTermExpenses) -
          calculateAmount(
            longTermExpenses.map((expense) => ({
              amount: calculateAmount(expense.transactions),
            })),
          ),
        fill: "#000",
        label: "Long Term Expenses",
      },
      {
        value: calculateAmount(shortTermExpenses),
        fill: "#fe502d",
        label: "Monthly Expenses",
      },
      {
        value: calculateAmount(
          debt.map((account) => ({ amount: account.balances.current || 0 })),
        ),
        fill: "#8c52ff",
        label: "Debt",
      },
      {
        value: calculateAmount(
          savingsAccounts.map((account) => ({ amount: account.totalSaved })),
        ),
        fill: "#41b8d5",
        label: "Savings Goals",
      },
    ],
    [longTermExpenses, shortTermExpenses, savingsAccounts, debt],
  );

  return (
    <>
      <FormSection label="Spending Totals">
        <Header level={4}>
          Total Left:{" "}
          {formatDollarAmount(
            netWorth -
              calculateAmount(barValues.map((i) => ({ amount: i.value }))),
          )}
        </Header>
        <ProgressBarMultiValue
          values={barValues.map((value) => ({
            ...value,
            label: formatDollarAmount(value.value),
          }))}
          total={netWorth}
        />
        <div className="mt-2">
          <ChartLegend values={barValues} total={netWorth} noSort />
        </div>
        <div className="mt-2 flex flex-col gap-2">
          {savingsAccounts.map((account, i) => (
            <SavingGoalTotal
              key={account.name}
              account={account}
              fill={fills[i % fills.length]}
            />
          ))}
        </div>
      </FormSection>
    </>
  );
};

const SavingGoalTotal: React.FunctionComponent<{
  account: SavingsAccount;
  fill: HexColor;
}> = ({ account, fill }) => {
  const calculateTargetDate = (account: SavingsAccount) => {
    const today = new Date();
    const months = Math.floor(
      (account.targetAmount - account.totalSaved) / account.monthlyContribution,
    );
    const targetDate = new Date(today);
    targetDate.setMonth(today.getMonth() + months);
    return targetDate;
  };

  const targetDate = calculateTargetDate(account);
  return (
    <div className="flex gap-2 items-center" key={account.name}>
      <div>{account.name}</div>
      <div>{formatDollarAmount(account.totalSaved)}</div>
      <ProgressBarMultiValue
        className="flex-1"
        values={[
          {
            value: account.totalSaved,
            fill,
            label: formatDollarAmount(account.totalSaved),
          },
        ]}
        total={account.targetAmount}
      />
      <div>
        <span className="text-sm">left to save:</span>{" "}
        {formatDollarAmount(account.targetAmount - account.totalSaved)} (
        {displayDate(targetDate)})
      </div>
    </div>
  );
};

const fills = ["#41b8d5", "#8c52ff"] as const;
