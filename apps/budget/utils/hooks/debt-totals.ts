import { AccountBase, AccountType } from "plaid";
import { calculateAmount } from "../utils";
import { useMemo } from "react";

export const useDebtTotals = (accounts: AccountBase[]) => {
  const debt = useMemo(
    () => accounts.filter((account) => account.type === AccountType.Credit),
    [accounts],
  );

  return calculateAmount(
    debt.map((account) => ({ amount: account.balances.current || 0 })),
  );
};
