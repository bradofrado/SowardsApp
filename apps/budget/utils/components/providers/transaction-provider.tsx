"use client";
import {
  Budget,
  BudgetItem,
  CategoryBudget,
  SpendingRecord,
} from "model/src/budget";
import { toUTC } from "model/src/utils";
import { createContext, useContext, useMemo } from "react";
import { SpendingRecordWithAccountType } from "api/src/services/budget";
import { AccountType } from "plaid";
import { isTransferTransactionAndUpdateCache } from "../../utils";

interface TransactionState {
  transactions: SpendingRecordWithAccountType[];
  budgetItems: BudgetItem[];
  categories: CategoryBudget[];
  type: "expense" | "income";
}

interface TransactionContextState {
  expenses: TransactionState;
  income: TransactionState;
  transactions: SpendingRecordWithAccountType[];
  budget: Budget | undefined;
  categories: CategoryBudget[];
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
  transactions: [],
  budget: undefined,
  categories: [],
});

interface TransactionProviderProps {
  transactions: SpendingRecordWithAccountType[];
  budget?: Budget;
  categories: CategoryBudget[];
  children: React.ReactNode;
}
export const TransactionProvider: React.FunctionComponent<
  TransactionProviderProps
> = ({ transactions: transactionsRaw, budget, categories, children }) => {
  const transactions = useMemo(
    () =>
      transactionsRaw.map((t) => ({
        ...t,
        date: toUTC(t.date),
        recordDate: toUTC(t.recordDate),
      })),
    [transactionsRaw],
  );
  const nonTransferTransactions = useMemo(() => {
    const transferCache = transactions.slice();
    // Filter out transfer transactions and split out transaction categories into their own transactions
    return transactions.reduce<SpendingRecordWithAccountType[]>(
      (prev, curr) => {
        // Only filter out implicit transfer transactions
        if (
          !curr.isTransfer &&
          isTransferTransactionAndUpdateCache(curr, transferCache)
        ) {
          return prev;
        }
        if (curr.transactionCategories.length > 0) {
          return [
            ...prev,
            ...curr.transactionCategories.map((c) => ({
              ...curr,
              amount: c.amount,
              transactionCategories: [c],
            })),
          ];
        }

        return [...prev, curr];
      },
      [],
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
        transactions: nonTransferTransactions,
        budget,
        categories,
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
  if (transaction.transactionCategories.length > 0) {
    return transaction.transactionCategories.some(
      (tc) => tc.category.type === "income",
    );
  }

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
