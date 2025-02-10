"use client";
import { BudgetItem, SpendingRecord } from "model/src/budget";
import { AccountBase } from "plaid";
import { createContext, useContext } from "react";
import { SavingsAccount } from "./types";

interface AccountContextState {
  accounts: AccountBase[];
}
const AccountContext = createContext<AccountContextState>({
  accounts: [],
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
  return (
    <AccountContext.Provider value={{ accounts }}>
      {children}
    </AccountContext.Provider>
  );
};

export const useAccounts = () => {
  return useContext(AccountContext);
};
