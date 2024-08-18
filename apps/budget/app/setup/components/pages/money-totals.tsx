import { Header } from "ui/src/components/core/header";
import { SetupPage } from "../register-pages";
import { useAccountTotals } from "../../../../utils/hooks/account-totals";
import { formatDollarAmount } from "model/src/utils";
import { Confetti } from "../../../../utils/components/totals/confetti";
import { AccountTotals } from "../../../../utils/components/totals/account-totals";
import { Card } from "ui/src/components/core/card";
import { TransactionTotals } from "../../../../utils/components/totals/transaction-totals";
import { useCallback } from "react";

export const MoneyTotals: SetupPage = ({ accounts, setShowNext }) => {
  const { netWorth } = useAccountTotals(accounts);

  return (
    <div>
      <div className="text-center">
        <Header level={1}>
          Your net worth is {formatDollarAmount(netWorth)}!
        </Header>
        <p className="mt-4 text-muted-foreground text-left">
          See your account and spending records below. We have estimated your
          monthly income and spending based on your transactions so you can
          predict the future with your money.
        </p>
      </div>
      <div className="flex flex-col gap-2 mt-4">
        <AccountTotals future />
        <Card className="flex-1" label="Monthly Totals">
          <TransactionTotals label="" type="income" />
        </Card>
      </div>
      <Confetti />
    </div>
  );
};
