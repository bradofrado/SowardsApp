import { Header } from "ui/src/components/core/header";
import { SetupPage } from "../register-pages";
import { useAccountTotals } from "../../../../utils/hooks/account-totals";
import { formatDollarAmount } from "model/src/utils";
import { Confetti } from "../../../../utils/components/totals/confetti";
import { AccountTotals } from "../../../../utils/components/totals/account-totals";
import { Card } from "ui/src/components/core/card";
import { TransactionTotals } from "../../../../utils/components/totals/transaction-totals";
import { useCallback } from "react";
import { AccountBase } from "plaid";

export const MoneyTotals: SetupPage = ({ accounts, setShowNext }) => {
  return (
    <>
      <div className="flex flex-col gap-2 mt-4">
        <AccountTotals future />
        <Card className="flex-1" label="Monthly Totals">
          <TransactionTotals label="" type="income" />
        </Card>
      </div>
      <Confetti />
    </>
  );
};

export const useMoneyTotals = ({ accounts }: { accounts: AccountBase[] }) => {
  const { netWorth } = useAccountTotals(accounts);

  return { dynamicTitle: `Your Net Worth is ${formatDollarAmount(netWorth)}!` };
};
