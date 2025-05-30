import { withAuth } from "next-utils/src/utils/protected-routes-hoc";
import {
  getBudgets,
  getExternalLogins,
  getTransactions,
  getTransactionsWithAccounts,
} from "api/src/services/budget";
import { CategoryMonthView } from "../../utils/components/totals/category-month-view";
import { getCategories } from "api/src/repositories/budget/category";
import { prisma } from "db/lib/prisma";
import { TransactionTotals } from "../../utils/components/totals/transaction-totals";
import { FormDivider } from "ui/src/components/catalyst/form/form";
import { TransactionProvider } from "../../utils/components/providers/transaction-provider";
import { Card } from "ui/src/components/core/card";
import { AccountProvider } from "../../utils/components/providers/account-provider";
import { AccountTotals } from "../../utils/components/totals/account-totals";
import { redirect } from "next/navigation";
import { UpdateItemModal } from "../../utils/components/update-item-modal";
import { ActionList } from "../../utils/components/actions/action-list";
import { SpendingTotals } from "../../utils/components/totals/spending-totals";

const Home = withAuth(async ({ ctx }) => {
  const userId = ctx.session.auth.userVacation.id;
  try {
    const accounts = await getExternalLogins(userId);
    if (accounts.length === 0) {
      redirect("/setup");
    }
    const spending = await getTransactionsWithAccounts(userId, accounts);
    const categories = await getCategories({ db: prisma, userId });
    const budgets = await getBudgets(userId);
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
          <SpendingTotals />
          <FormDivider />
          <ActionList userId={userId} />
          <FormDivider />
          <CategoryMonthView />
        </AccountProvider>
      </TransactionProvider>
    );
  } catch (err) {
    console.error(err);

    return <UpdateItemModal accessToken={err.message} />;
  }
});

export default Home;
