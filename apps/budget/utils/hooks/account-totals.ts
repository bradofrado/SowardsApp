import { AccountBase, AccountType } from "plaid";

interface AccountTotalsState {
  netWorth: number;
}
export const useAccountTotals = (
  accounts: AccountBase[],
): AccountTotalsState => {
  const netWorth = accounts.reduce<number>((prev, curr) => {
    return (
      prev +
      (curr.type === AccountType.Depository && curr.balances.current
        ? curr.balances.current
        : 0)
    );
  }, 0);
  return { netWorth };
};
