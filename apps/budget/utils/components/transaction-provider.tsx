"use client";
import {
  Budget,
  BudgetItem,
  CategoryBudget,
  SpendingRecord,
} from "model/src/budget";
import { isDateInBetween } from "model/src/utils";
import { createContext, useContext, useMemo } from "react";
import { months } from "../../app/components/types";

interface TransactionContextState {
  transactions: SpendingRecord[];
  budgetItems: BudgetItem[];
  categories: CategoryBudget[];
}
const TransactionContext = createContext<TransactionContextState>({
  transactions: [],
  budgetItems: [],
  categories: [],
});

interface TransactionProviderProps {
  transactions: SpendingRecord[];
  budget: Budget | undefined;
  categories: CategoryBudget[];
  children: React.ReactNode;
}
export const TransactionProvider: React.FunctionComponent<
  TransactionProviderProps
> = ({ transactions, budget, categories, children }) => {
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
    () => transactions.filter((transaction) => filterFunction(transaction)),
    [transactions],
  );
  const filteredBudgeted = useMemo(
    () => budget?.items.filter((item) => filterFunction(item)) ?? [],
    [budget],
  );
  const filteredCategories = useMemo(
    () => categories.filter((category) => filterFunction(category)),
    [categories],
  );

  return (
    <TransactionContext.Provider
      value={{
        transactions: filteredTransactions,
        budgetItems: filteredBudgeted,
        categories: filteredCategories,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  return useContext(TransactionContext);
};
