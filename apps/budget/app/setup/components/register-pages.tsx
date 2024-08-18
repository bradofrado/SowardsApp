import { UserVacation } from "model/src/vacation";
import { ExternalAccount } from "../../../utils/components/totals/connect-external-form";
import { AddAccounts } from "./pages/add-accounts";
import { CreateUser, useCreateUser } from "./pages/create-user";
import { MoneyTotals } from "./pages/money-totals";

interface SetupPageProps {
  accounts: ExternalAccount[];
  user: UserVacation | undefined;
  setShowNext: (value: boolean) => void;
}
export type SetupPage = React.FunctionComponent<SetupPageProps>;
interface SetupPageOptions {
  title: string;
  description: string;
  component: SetupPage;
  defaultShowNext?: boolean;
  onNext?: () => Promise<void>;
}
export const usePages = (props: SetupPageProps) => {
  const { onNext } = useCreateUser({ user: props.user });
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
      description:
        " See your account and spending records below. We have estimated your monthly income and spending based on your transactions so you can predict the future with your money.",
      component: MoneyTotals,
    },
  ];

  return pages;
};
