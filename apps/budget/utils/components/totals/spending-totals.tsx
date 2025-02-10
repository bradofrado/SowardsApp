"use client";
import { useMemo, useState } from "react";
import { useTransactions } from "../providers/transaction-provider";
import { ProgressBarMultiValue } from "ui/src/components/feature/reporting/graphs/progressbar-multivalue";
import { useAccountTotals } from "../../hooks/account-totals";
import { useAccounts } from "../providers/account-provider";
import { GraphValue } from "ui/src/components/feature/reporting/graphs/types";
import { calculateAmount } from "../../utils";
import { FormSection } from "ui/src/components/catalyst/form/form";
import {
  displayDate,
  formatDollarAmount,
  isDateInBetween,
} from "model/src/utils";
import { ChartLegend } from "ui/src/components/feature/reporting/graphs/chart-legend";
import { SavingsAccount } from "../providers/types";
import { HexColor } from "model/src/core/colors";
import { Header } from "ui/src/components/core/header";
import { AccountType } from "plaid";
import { useExpenses } from "../../hooks/expenses";
import { BudgetItem, CategoryBudget } from "model/src/budget";
import { Button } from "ui/src/components/catalyst/button";
import { UpdateBudgetModal } from "../budget/update-budget-modal";
import { useUpdateBudget } from "../../hooks/update-budget";

export const SpendingTotals: React.FunctionComponent = () => {
  const { expenses, budget, categories } = useTransactions();
  const { accounts } = useAccounts();
  const { netWorth } = useAccountTotals(accounts);
  const updateBudget = useUpdateBudget();
  const [showEditBudget, setShowEditBudget] = useState(false);

  const { longTermExpenses, shortTermExpenses, savingsGoals } = useExpenses({
    budgetItems: expenses.budgetItems,
    transactions: expenses.transactions,
    date: new Date(),
  });

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
        value: calculateAmount(savingsGoals),
        fill: "#41b8d5",
        label: "Savings Goals",
      },
    ],
    [longTermExpenses, shortTermExpenses, savingsGoals, debt],
  );

  return (
    <>
      <FormSection
        label="Spending Totals"
        button={
          budget ? (
            <Button onClick={() => setShowEditBudget(true)} plain>
              Edit Budget
            </Button>
          ) : undefined
        }
      >
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
          {savingsGoals.map((savingsGoal, i) => (
            <SavingGoalTotal
              key={savingsGoal.category.name}
              savingsGoal={savingsGoal}
              fill={fills[i % fills.length]}
            />
          ))}
        </div>
      </FormSection>
      {budget ? (
        <UpdateBudgetModal
          show={showEditBudget}
          onClose={() => setShowEditBudget(false)}
          budget={budget}
          categories={categories}
          title="Edit Budget"
          description="Edit the budget to plan for your future!"
          onSave={async (item) => {
            await updateBudget(item);
            setShowEditBudget(false);
          }}
        />
      ) : null}
    </>
  );
};

const SavingGoalTotal: React.FunctionComponent<{
  savingsGoal: BudgetItem;
  fill: HexColor;
}> = ({ savingsGoal, fill }) => {
  const calculateTargetDate = (savingsGoal: BudgetItem) => {
    const today = new Date();
    const months = Math.floor(
      (savingsGoal.targetAmount - savingsGoal.amount) /
        savingsGoal.cadenceAmount,
    );
    const targetDate = new Date(today);
    targetDate.setMonth(today.getMonth() + months);
    return targetDate;
  };

  const targetDate = calculateTargetDate(savingsGoal);
  return (
    <div className="flex gap-2 items-center" key={savingsGoal.id}>
      <div>{savingsGoal.category.name}</div>
      <div>{formatDollarAmount(savingsGoal.amount)}</div>
      <ProgressBarMultiValue
        className="flex-1"
        values={[
          {
            value: savingsGoal.amount,
            fill,
            label: formatDollarAmount(savingsGoal.amount),
          },
        ]}
        total={savingsGoal.targetAmount}
      />
      <div>
        <span className="text-sm">left to save:</span>{" "}
        {formatDollarAmount(savingsGoal.targetAmount - savingsGoal.amount)} (
        {displayDate(targetDate)})
      </div>
    </div>
  );
};

const fills = ["#41b8d5", "#8c52ff"] as const;
