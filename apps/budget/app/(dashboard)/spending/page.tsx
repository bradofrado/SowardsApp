import { getCategories } from "api/src/repositories/budget/category";
import { prisma } from "db/lib/prisma";
import { getExternalLogins, getTransactions } from "api/src/services/budget";
import { withAuth } from "next-utils/src/utils/protected-routes-hoc";
import { SpendingForm } from "./components/spending-form";
import { redirect } from "next/navigation";
import { TransactionProvider } from "../../../utils/components/providers/transaction-provider";

const ITEMS_PER_PAGE = 50;

const SpendingPage = withAuth(async ({ ctx, searchParams }) => {
  const userId = ctx.session.auth.userVacation.id;
  const isPaginated =
    !searchParams?.grouping || searchParams?.grouping === "all";
  let page = isPaginated ? Math.max(1, Number(searchParams?.page || "1")) : 1;
  if (isNaN(page)) {
    page = 1;
  }
  const start = (page - 1) * ITEMS_PER_PAGE;

  const [categories, accounts, transactions] = await Promise.all([
    getCategories({ db: prisma, userId }),
    getExternalLogins(userId),
    getTransactions(userId, {
      start,
      count: isPaginated ? ITEMS_PER_PAGE : undefined,
    }),
  ]);

  // If page is greater than total pages, redirect to page 1
  if (isPaginated) {
    const totalPages = Math.ceil(transactions.total / ITEMS_PER_PAGE);
    if (page > totalPages) {
      // Preserve other search params when redirecting
      const params = new URLSearchParams();
      Object.entries(searchParams || {}).forEach(([key, value]) => {
        if (typeof value === "string") {
          params.set(key, value);
        }
      });
      params.set("page", "1");
      redirect(`/spending?${params.toString()}`);
    }
  }

  return (
    <TransactionProvider
      transactions={transactions.records}
      categories={categories}
    >
      <SpendingForm
        accounts={accounts}
        isPaginated={isPaginated}
        total={transactions.total}
      />
    </TransactionProvider>
  );
});

export default SpendingPage;
