"use client";
import { useCallback, useMemo, useState } from "react";
import { useTransactions } from "../providers/transaction-provider";
import { ProgressBarMultiValue } from "ui/src/components/feature/reporting/graphs/progressbar-multivalue";
import { useAccountTotals } from "../../hooks/account-totals";
import { useAccounts } from "../providers/account-provider";
import { GraphValue } from "ui/src/components/feature/reporting/graphs/types";
import { calculateAmount } from "../../utils";
import { FormSection } from "ui/src/components/catalyst/form/form";
import { displayDate, formatDollarAmount } from "model/src/utils";
import { ChartLegend } from "ui/src/components/feature/reporting/graphs/chart-legend";
import { HexColor } from "model/src/core/colors";
import { Header } from "ui/src/components/core/header";
import { useExpenses } from "../../hooks/expenses";
import { BudgetItem } from "model/src/budget";
import { Button } from "ui/src/components/catalyst/button";
import { UpdateBudgetModal } from "../budget/update-budget-modal";
import { useUpdateBudget } from "../../hooks/update-budget";
import { useDebtTotals } from "../../hooks/debt-totals";
import { TransferFundsModal } from "../actions/transfer-funds";

export const SpendingTotals: React.FunctionComponent = () => {
  const { expenses, budget, categories } = useTransactions();
  const { accounts } = useAccounts();
  const { netWorth } = useAccountTotals(accounts);
  const updateBudget = useUpdateBudget();
  const [showEditBudget, setShowEditBudget] = useState(false);
  const [showTransferFunds, setShowTransferFunds] = useState(false);
  const {
    eventually,
    monthly: shortTermExpenses,
    yearly,
    fixed: savingsGoals,
  } = useExpenses({
    budgetItems: expenses.budgetItems,
    transactions: expenses.transactions,
    date: new Date(),
  });

  const longTermExpenses = useMemo(() => {
    return [...eventually, ...yearly];
  }, [eventually, yearly]);

  const debt = useDebtTotals(accounts);

  const expenseFills: Record<string, HexColor> = {
    shortTerm: "#fe502d",
    longTerm: "#000",
    debt: "#8c52ff",
    savings: "#41b8d5",
    transfers: "#7ed957",
  };

  const getFill = useCallback(
    (item: BudgetItem) => {
      if (shortTermExpenses.find((expense) => expense.id === item.id)) {
        return expenseFills.shortTerm;
      } else if (longTermExpenses.find((expense) => expense.id === item.id)) {
        return expenseFills.longTerm;
      } else if (savingsGoals.find((expense) => expense.id === item.id)) {
        return expenseFills.savings;
      } else {
        return expenseFills.debt;
      }
    },
    [shortTermExpenses, longTermExpenses, savingsGoals],
  );

  const unmetGoals = useMemo(
    () =>
      [...shortTermExpenses, ...longTermExpenses, ...savingsGoals].filter(
        (item) => item.amount < item.targetAmount,
      ),
    [],
  );

  const monthlyTransfers = useMemo(() => {
    return unmetGoals.map((item) => ({
      amount: Math.min(item.cadenceAmount, item.targetAmount - item.amount),
    }));
  }, [unmetGoals]);

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
        fill: expenseFills.longTerm,
        label: "Long Term Expenses",
      },
      {
        value:
          calculateAmount(shortTermExpenses) -
          calculateAmount(
            shortTermExpenses.map((expense) => ({
              amount: calculateAmount(expense.transactions),
            })),
          ),
        fill: expenseFills.shortTerm,
        label: "Monthly Expenses",
      },
      {
        value: debt,
        fill: expenseFills.debt,
        label: "Debt",
      },
      {
        value: calculateAmount(savingsGoals),
        fill: expenseFills.savings,
        label: "Savings Goals",
      },
      {
        value: calculateAmount(monthlyTransfers),
        fill: expenseFills.transfers,
        label: "Monthly Transfers",
      },
    ],
    [longTermExpenses, shortTermExpenses, savingsGoals, debt, monthlyTransfers],
  );

  return (
    <>
      <FormSection
        label="Spending Totals"
        button={
          <div className="flex gap-2">
            <Button onClick={() => setShowTransferFunds(true)} plain>
              Transfer Funds
            </Button>
            {budget ? (
              <Button onClick={() => setShowEditBudget(true)} plain>
                Edit Budget
              </Button>
            ) : undefined}
          </div>
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
          {unmetGoals.map((item) => (
            <SavingGoalTotal
              key={item.category.name}
              savingsGoal={item}
              fill={getFill(item)}
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
      <TransferFundsModal
        show={showTransferFunds}
        onClose={() => setShowTransferFunds(false)}
        items={expenses.budgetItems}
      />
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
