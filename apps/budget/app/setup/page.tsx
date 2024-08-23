import {
  withAuth,
  withSession,
} from "next-utils/src/utils/protected-routes-hoc";
import { WelcomeModal } from "./welcome-modal";
import {
  getExternalLogins,
  getTransactions,
  getTransactionsWithAccounts,
} from "api/src/services/budget";
import { SetupStepper } from "./components/setup-stepper";
import { AccountProvider } from "../../utils/components/providers/account-provider";
import { TransactionProvider } from "../../utils/components/providers/transaction-provider";
import { getCategories } from "api/src/repositories/budget/category";
import { prisma } from "db/lib/prisma";
import { getAuthSession } from "next-utils/src/utils/auth";
import { getBudgets } from "api/src/repositories/budget/template/budget-template";

const SetupPage = async () => {
  const session = await getAuthSession();
  const userId = session?.auth.userVacation?.id;
  const accounts = userId ? await getExternalLogins(userId) : [];
  const transactions = userId
    ? await getTransactionsWithAccounts(userId, accounts)
    : [];
  const categories = userId ? await getCategories({ db: prisma, userId }) : [];
  const budgets = userId ? await getBudgets({ db: prisma, userId }) : [];
  return (
    <AccountProvider
      accounts={accounts}
      transactions={transactions}
      budgetItems={budgets[0]?.items ?? []}
    >
      <TransactionProvider
        transactions={transactions}
        categories={categories}
        budget={budgets[0]}
      >
        <SetupStepper
          budget={budgets[0]}
          accounts={accounts}
          user={session?.auth.userVacation}
          categories={categories}
        />
      </TransactionProvider>
    </AccountProvider>
  );
};

export default SetupPage;
