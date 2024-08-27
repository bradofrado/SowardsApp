"use client";
import { BudgetItem, SavingsGoal, SpendingRecord } from "model/src/budget";
import { AccountBase } from "plaid";
import { createContext, useContext } from "react";
import { SavingsAccount } from "./types";

interface AccountContextState {
  accounts: AccountBase[];
  savingsAccounts: SavingsAccount[];
}
const AccountContext = createContext<AccountContextState>({
  accounts: [],
  savingsAccounts: [],
});

interface AccountProviderProps {
  children: React.ReactNode;
  accounts: AccountBase[];
  transactions: SpendingRecord[];
  savingsGoals: SavingsGoal[];
}
export const AccountProvider: React.FunctionComponent<AccountProviderProps> = ({
  children,
  accounts,
  transactions,
  savingsGoals,
}) => {
  const savingsAccounts = getSavingsAccounts(transactions, savingsGoals);
  return (
    <AccountContext.Provider value={{ accounts, savingsAccounts }}>
      {children}
    </AccountContext.Provider>
  );
};

const getSavingsAccounts = (
  transactions: SpendingRecord[],
  savingsGoals: SavingsGoal[],
): SavingsAccount[] => {
  return savingsGoals.map((account) => ({
    name: account.category.name,
    transactions: transactions.filter(
      (transaction) =>
        transaction.transactionCategories[0]?.category.id ===
        account.category.id,
    ),
    monthlyContribution: account.amount,
  }));
};

export const useAccounts = () => {
  return useContext(AccountContext);
};
