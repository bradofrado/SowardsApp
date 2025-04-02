import { getCategories } from "api/src/repositories/budget/category";
import { prisma } from "db/lib/prisma";
import { getExternalLogins, getTransactions } from "api/src/services/budget";
import { withAuth } from "next-utils/src/utils/protected-routes-hoc";
import { SpendingForm } from "../spending/components/spending-form";

const ITEMS_PER_PAGE = 50;

const SpendingPage = withAuth(async ({ ctx, searchParams }) => {
  const userId = ctx.session.auth.userVacation.id;
  const isPaginated =
    !searchParams?.grouping || searchParams?.grouping === "all";
  const page = isPaginated ? Number(searchParams?.page || "1") : 1;
  const start = (page - 1) * ITEMS_PER_PAGE;

  const [categories, accounts, transactions] = await Promise.all([
    getCategories({ db: prisma, userId }),
    getExternalLogins(userId),
    getTransactions(userId, {
      start,
      count: isPaginated ? ITEMS_PER_PAGE : undefined,
    }),
  ]);

  return (
    <>
      <SpendingForm
        transactions={transactions.records}
        categories={categories}
        accounts={accounts}
        isPaginated={isPaginated}
        total={transactions.total}
      />
    </>
  );
});

export default SpendingPage;
