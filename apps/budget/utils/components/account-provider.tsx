"use client";
import { AccountBase } from "plaid";
import { createContext, useContext } from "react";

interface AccountContextState {
  accounts: AccountBase[];
}
const AccountContext = createContext<AccountContextState>({
  accounts: [],
});

interface AccountProviderProps {
  children: React.ReactNode;
  accounts: AccountBase[];
}
export const AccountProvider: React.FunctionComponent<AccountProviderProps> = ({
  children,
  accounts,
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
