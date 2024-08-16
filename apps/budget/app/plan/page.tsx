import { CategoryForm } from "./components/category-form";
import { getCategories } from "api/src/repositories/budget/category";
import { prisma } from "db/lib/prisma";
import { getExternalLogins, getTransactions } from "api/src/services/budget";
import { withAuth } from "next-utils/src/utils/protected-routes-hoc";
import { SpendingForm } from "./components/spending/spending-form";

const Plan = withAuth(async ({ ctx }) => {
  const userId = ctx.session.auth.userVacation.id;
  const categories = await getCategories({ db: prisma, userId });
  const transactions = await getTransactions(ctx.session.auth.userVacation.id);
  const accounts = await getExternalLogins(ctx.session.auth.userVacation.id);

  return (
    <>
      <CategoryForm categories={categories} />
      <SpendingForm
        transactions={transactions}
        categories={categories}
        accounts={accounts}
      />
    </>
  );
});

export default Plan;
