import { CategoryForm } from "./components/category-form";
import { getCategories } from "api/src/repositories/budget/category";
import { prisma } from "db/lib/prisma";
import { getExternalLogins, getTransactions } from "api/src/services/budget";
import { withAuth } from "next-utils/src/utils/protected-routes-hoc";
import { SpendingForm } from "../spending/components/spending-form";
import { BudgetForm } from "./components/budget-form";
import { getBudgets } from "api/src/repositories/budget/template/budget-template";
import { FormDivider } from "ui/src/components/catalyst/form/form";

const Plan = withAuth(async ({ ctx }) => {
  const userId = ctx.session.auth.userVacation.id;
  const categories = await getCategories({ db: prisma, userId });
  const budgets = await getBudgets({ db: prisma, userId });
  return (
    <>
      <BudgetForm budgets={budgets} categories={categories} />
      <FormDivider className="mx-auto max-w-4xl" />
      <CategoryForm categories={categories} />
    </>
  );
});

export default Plan;
