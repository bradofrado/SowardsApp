import { ExternalAccount } from "../../components/connect-external-form";
import { AddAccounts } from "./pages/add-accounts";

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
];
