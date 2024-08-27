import { withAuth } from "next-utils/src/utils/protected-routes-hoc";
import {
  getExternalLogins,
  getTransactions,
  getTransactionsWithAccounts,
} from "api/src/services/budget";
import { CategoryMonthView } from "../../utils/components/totals/category-month-view";
import { getCategories } from "api/src/repositories/budget/category";
import { prisma } from "db/lib/prisma";
import { getBudgets } from "api/src/repositories/budget/template/budget-template";
import { TransactionTotals } from "../../utils/components/totals/transaction-totals";
import { FormDivider } from "ui/src/components/catalyst/form/form";
import { TransactionProvider } from "../../utils/components/providers/transaction-provider";
import { Card } from "ui/src/components/core/card";
import { AccountProvider } from "../../utils/components/providers/account-provider";
import { AccountTotals } from "../../utils/components/totals/account-totals";
import { redirect } from "next/navigation";
import { Confetti } from "../../utils/components/totals/confetti";
import { BudgetItem, SpendingRecord } from "model/src/budget";
import { SavingsAccount } from "../../utils/components/providers/types";
import { UpdateItemModal } from "../../utils/components/update-item-modal";

const Home = withAuth(async ({ ctx }) => {
  const userId = ctx.session.auth.userVacation.id;
  try {
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
        <AccountProvider
          accounts={accounts}
          transactions={spending}
          savingsGoals={budgets[0]?.goals ?? []}
        >
          <div className="flex flex-col md:flex-row gap-2">
            <AccountTotals />
            <Card className="flex-1" label="Totals">
              <TransactionTotals label="" type="income" />
            </Card>
          </div>
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
