"use client";
import {
  Budget,
  BudgetItem,
  CategoryBudget,
  SpendingRecord,
} from "model/src/budget";
import { day, isDateInBetween } from "model/src/utils";
import { createContext, useContext, useMemo } from "react";
import { months } from "../totals/types";
import { SpendingRecordWithAccountType } from "api/src/services/budget";
import { AccountType } from "plaid";

interface TransactionState {
  transactions: SpendingRecordWithAccountType[];
  budgetItems: BudgetItem[];
  categories: CategoryBudget[];
  type: "expense" | "income";
}

interface TransactionContextState {
  expenses: TransactionState;
  income: TransactionState;
}
const TransactionContext = createContext<TransactionContextState>({
  expenses: {
    transactions: [],
    budgetItems: [],
    categories: [],
    type: "expense",
  },
  income: {
    transactions: [],
    budgetItems: [],
    categories: [],
    type: "income",
  },
});

interface TransactionProviderProps {
  transactions: SpendingRecordWithAccountType[];
  budget: Budget | undefined;
  categories: CategoryBudget[];
  children: React.ReactNode;
}
export const TransactionProvider: React.FunctionComponent<
  TransactionProviderProps
> = ({ transactions, budget, categories, children }) => {
  const nonTransferTransactions = useMemo(() => {
    const transferCache = transactions.slice();
    return transactions.filter(
      (transaction) =>
        !isTransferTransactionAndUpdateCache(transaction, transferCache),
    );
  }, [transactions]);
  const spendingFilter = useExpenseOrIncome({
    type: "expense",
    transactions: nonTransferTransactions,
    categories,
    budgetItems: budget?.items || [],
  });
  const incomeFilter = useExpenseOrIncome({
    type: "income",
    transactions: nonTransferTransactions,
    categories,
    budgetItems: budget?.items || [],
  });

  return (
    <TransactionContext.Provider
      value={{
        expenses: spendingFilter,
        income: incomeFilter,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

const useExpenseOrIncome = ({
  type,
  transactions,
  categories,
  budgetItems,
}: TransactionState): TransactionState => {
  const filteredTransactions = useMemo(
    () =>
      (type === "expense"
        ? filterExpenses(transactions)
        : filterIncome(transactions)
      ).map((transaction) =>
        type === "income"
          ? { ...transaction, amount: -transaction.amount }
          : transaction,
      ),
    [transactions, type],
  );
  const filteredCategories = useMemo(
    () => filterCategories(categories, type),
    [categories, type],
  );
  const filteredBudgeted = useMemo(
    () =>
      budgetItems.filter((item) =>
        filteredCategories.find((category) => category.id === item.category.id),
      ),
    [budgetItems, filteredCategories],
  );

  return {
    transactions: filteredTransactions,
    budgetItems: filteredBudgeted,
    categories: filteredCategories,
    type,
  };
};

const isTransferTransactionAndUpdateCache = (
  transaction: SpendingRecord,
  transferedCache: SpendingRecord[],
) => {
  //A transfer transaction is a transaction that has the reverse amount and is within 3 days of each other
  const transferTransactionIndex = transferedCache.findIndex(
    (a) =>
      Math.abs(a.date.getTime() - transaction.date.getTime()) <= 3 * day &&
      a.amount === -transaction.amount &&
      a.accountId !== transaction.accountId,
  );
  if (transferTransactionIndex > -1) {
    transferedCache.splice(transferTransactionIndex, 1);
    return true;
  }

  return false;
};

const filterCategories = (
  categories: CategoryBudget[],
  type: CategoryBudget["type"],
) => {
  return categories.filter((category) => category.type === type);
};

const filterExpenses = <T extends SpendingRecord>(transactions: T[]) => {
  return transactions.filter((transaction) => {
    return !isIncome(transaction);
  });
};

const isIncome = (transaction: SpendingRecordWithAccountType) => {
  if (transaction.amount >= 0) {
    return false;
  }

  if (transaction.accountType !== AccountType.Depository) {
    return false;
  }

  return true;
};

// A transaction is considered income if it is not a transfer, is a negative amount, and is coming from a depository account
const filterIncome = (transactions: SpendingRecordWithAccountType[]) => {
  return transactions.filter((transaction) => {
    return isIncome(transaction);
  });
};

export const useTransactions = () => {
  return useContext(TransactionContext);
};
