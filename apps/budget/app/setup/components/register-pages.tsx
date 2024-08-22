import { UserVacation } from "model/src/vacation";
import { ExternalAccount } from "../../../utils/components/totals/connect-external-form";
import { AddAccounts } from "./pages/add-accounts";
import { CreateUser, useCreateUser } from "./pages/create-user";
import { MoneyTotals, useMoneyTotals } from "./pages/money-totals";
import { CreateBudget } from "./pages/create-budget";
import { CategoryBudget } from "model/src/budget";

interface SetupPageProps {
  accounts: ExternalAccount[];
  categories: CategoryBudget[];
  user: UserVacation | undefined;
  setShowNext: (value: boolean) => void;
}
export type SetupPage = React.FunctionComponent<SetupPageProps>;
interface SetupPageOptions {
  title: string;
  dynamicTitle?: string;
  maxWidth?: string;
  description: string;
  component: SetupPage;
  defaultShowNext?: boolean;
  onNext?: () => Promise<void>;
}
export const usePages = (props: SetupPageProps) => {
  const { onNext } = useCreateUser({ user: props.user });
  const { dynamicTitle } = useMoneyTotals({ accounts: props.accounts });

  const pages: SetupPageOptions[] = [
    {
      title: "Create User",
      description: "First, create your user account.",
      component: CreateUser,
      defaultShowNext: false,
      onNext,
    },
    {
      title: "Add Accounts",
      description:
        "Connect your external accounts (bank accounts, credit carts, etc.)",
      component: AddAccounts,
      defaultShowNext: false,
    },
    {
      title: "See Totals",
      dynamicTitle,
      description:
        " See your account and spending records below. We have estimated your monthly income and spending based on your transactions so you can predict the future with your money.",
      component: MoneyTotals,
    },
    {
      title: "Create Budget",
      description: "Create a budget to help you manage your money.",
      component: CreateBudget,
      maxWidth: "1200px",
    },
  ];

  return pages;
};
