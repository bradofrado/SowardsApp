import { ExternalAccount } from "../../../utils/components/totals/connect-external-form";
import { AddAccounts } from "./pages/add-accounts";
import { CreateUser, useCreateUser } from "./pages/create-user";
import { MoneyTotals } from "./pages/money-totals";

export type SetupPage = React.FunctionComponent<{
  accounts: ExternalAccount[];
  setShowNext: (value: boolean) => void;
}>;
interface SetupPageProps {
  component: SetupPage;
  defaultShowNext?: boolean;
  onNext?: () => Promise<void>;
}
export const usePages = () => {
  const { onNext } = useCreateUser();
  const pages: SetupPageProps[] = [
    {
      component: CreateUser,
      defaultShowNext: false,
      onNext,
    },
    {
      component: AddAccounts,
      defaultShowNext: false,
    },
    {
      component: MoneyTotals,
    },
  ];

  return pages;
};
