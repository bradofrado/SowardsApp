import { CategoryForm } from "./components/category-form";
import { getCategories } from "api/src/repositories/budget/category";
import { prisma } from "db/lib/prisma";
import { getExternalLogins, getTransactions } from "api/src/services/budget";
import { withAuth } from "next-utils/src/utils/protected-routes-hoc";
import { SpendingForm } from "../spending/components/spending-form";

const Plan = withAuth(async ({ ctx }) => {
  const userId = ctx.session.auth.userVacation.id;
  const categories = await getCategories({ db: prisma, userId });

  return (
    <>
      <CategoryForm categories={categories} />
    </>
  );
});

export default Plan;
