import { withAuth } from "next-utils/src/utils/protected-routes-hoc";
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

const SetupPage = withAuth(async ({ ctx }) => {
  const userId = ctx.session.auth.userVacation.id;
  const accounts = await getExternalLogins(userId);
  const transactions = await getTransactionsWithAccounts(userId, accounts);
  const categories = await getCategories({ db: prisma, userId });
  return (
    <AccountProvider accounts={accounts}>
      <TransactionProvider
        transactions={transactions}
        categories={categories}
        budget={undefined}
      >
        <SetupStepper accounts={accounts} />
      </TransactionProvider>
    </AccountProvider>
  );
});

export default SetupPage;
