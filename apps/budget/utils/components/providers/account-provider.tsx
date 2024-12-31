"use client";
import { BudgetItem, SpendingRecord } from "model/src/budget";
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
}
export const AccountProvider: React.FunctionComponent<AccountProviderProps> = ({
  children,
  accounts,
  transactions,
}) => {
  const savingsAccounts = getSavingsAccounts(transactions);
  return (
    <AccountContext.Provider value={{ accounts, savingsAccounts }}>
      {children}
    </AccountContext.Provider>
  );
};

const getSavingsAccounts = (
  transactions: SpendingRecord[],
): SavingsAccount[] => {
  return [];
};

export const useAccounts = () => {
  return useContext(AccountContext);
};
