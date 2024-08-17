import { withAuth } from "next-utils/src/utils/protected-routes-hoc";
import { CategoryNegativeChart } from "./components/charts/negative-chart";
import {
  getTransactions,
  getTransactionsWithAccounts,
} from "api/src/services/budget";
import { CategoryMonthView } from "./components/category-month-view";
import { getCategories } from "api/src/repositories/budget/category";
import { prisma } from "db/lib/prisma";
import { getBudgets } from "api/src/repositories/budget/template/budget-template";
import { TransactionTotals } from "./components/transaction-totals";
import { FormDivider } from "ui/src/components/catalyst/form/form";
import { TransactionProvider } from "../utils/components/transaction-provider";
import { Card } from "ui/src/components/core/card";

const Home = withAuth(async ({ ctx }) => {
  const userId = ctx.session.auth.userVacation.id;
  const spending = await getTransactionsWithAccounts(userId);
  const categories = await getCategories({ db: prisma, userId });
  const budgets = await getBudgets({ db: prisma, userId });
  return (
    <TransactionProvider
      transactions={spending}
      budget={budgets[0]}
      categories={categories}
    >
      <div className="flex gap-2">
        <Card className="flex-1">
          <TransactionTotals label="Income Totals" type="income" />
        </Card>
        <Card className="flex-1">
          <TransactionTotals label="Spending Totals" type="expense" />
        </Card>
      </div>
      <FormDivider />
      <CategoryMonthView />
    </TransactionProvider>
  );
});

export default Home;
