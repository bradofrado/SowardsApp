import { ExternalAccount } from "../../../utils/components/totals/connect-external-form";
import { AddAccounts } from "./pages/add-accounts";
import { MoneyTotals } from "./pages/money-totals";

export type SetupPage = React.FunctionComponent<{
  accounts: ExternalAccount[];
  setShowNext: (value: boolean) => void;
}>;
interface SetupPageProps {
  component: SetupPage;
  defaultShowNext?: boolean;
}
export const pages: SetupPageProps[] = [
  {
    component: AddAccounts,
    defaultShowNext: false,
  },
  {
    component: MoneyTotals,
  },
];
