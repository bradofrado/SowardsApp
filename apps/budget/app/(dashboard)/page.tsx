import { withAuth } from "next-utils/src/utils/protected-routes-hoc";
import { CategoryNegativeChart } from "../components/charts/negative-chart";
import {
  getExternalLogins,
  getTransactions,
  getTransactionsWithAccounts,
} from "api/src/services/budget";
import { CategoryMonthView } from "../components/category-month-view";
import { getCategories } from "api/src/repositories/budget/category";
import { prisma } from "db/lib/prisma";
import { getBudgets } from "api/src/repositories/budget/template/budget-template";
import { TransactionTotals } from "../components/transaction-totals";
import { FormDivider } from "ui/src/components/catalyst/form/form";
import { TransactionProvider } from "../../utils/components/transaction-provider";
import { Card } from "ui/src/components/core/card";
import { AccountProvider } from "../../utils/components/account-provider";
import { AccountTotals } from "../components/account-totals";
import { redirect } from "next/navigation";
import { Confetti } from "../components/confetti";

const Home = withAuth(async ({ ctx }) => {
  const userId = ctx.session.auth.userVacation.id;
  const accounts = await getExternalLogins(userId);
  if (accounts.length === 0) {
    redirect("/setup");
  }
  const spending = await getTransactionsWithAccounts(userId, accounts);
  const categories = await getCategories({ db: prisma, userId });
  const budgets = await getBudgets({ db: prisma, userId });
  return (
    <TransactionProvider
      transactions={spending}
      budget={budgets[0]}
      categories={categories}
    >
      <AccountProvider accounts={accounts}>
        <div className="flex flex-col md:flex-row gap-2">
          <AccountTotals />
          <Card className="flex-1" label="Totals">
            <TransactionTotals label="" type="income" />
          </Card>
        </div>
        <FormDivider />
        <CategoryMonthView />
        <Confetti />
      </AccountProvider>
    </TransactionProvider>
  );
});

export default Home;