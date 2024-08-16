import { withAuth } from "next-utils/src/utils/protected-routes-hoc";
import { CategoryNegativeChart } from "./components/charts/negative-chart";
import { getTransactions } from "api/src/services/budget";
import { CategoryMonthView } from "./components/category-month-view";
import { getCategories } from "api/src/repositories/budget/category";
import { prisma } from "db/lib/prisma";
import { getBudgets } from "api/src/repositories/budget/template/budget-template";
import { SpendingTotals } from "./components/spending-totals";
import { FormDivider } from "ui/src/components/catalyst/form/form";

const Home = withAuth(async ({ ctx }) => {
  const userId = ctx.session.auth.userVacation.id;
  const spending = await getTransactions(userId);
  const categories = await getCategories({ db: prisma, userId });
  const budgets = await getBudgets({ db: prisma, userId });
  return (
    <div>
      <SpendingTotals transactions={spending} budget={budgets[0]} />
      <FormDivider />
      <CategoryMonthView
        transactions={spending}
        categories={categories}
        budget={budgets[0]}
      />
    </div>
  );
});

export default Home;
