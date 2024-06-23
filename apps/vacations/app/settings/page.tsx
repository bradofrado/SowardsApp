import { getUserVactions } from "api/src/repositories/user-vacation";
import type { UserVacation } from "model/src/vacation";
import { getAuthSession } from "../../utils/auth";
import { updateUser } from "./components/actions";
import { ConnectAccountForm } from "./components/connect-account-form";

const SetupPage = async (): Promise<JSX.Element> => {
  const session = await getAuthSession();
  const onSubmit = updateUser;
  const user: UserVacation = session?.auth.userVacation || {
    id: "",
    name: "New Family",
    color: "blue",
    createdByEvents: [],
    dependents: [],
    eventIds: [],
    events: [],
    groupIds: [],
    groups: [],
  };
  const users = await getUserVactions();

  return <ConnectAccountForm onUpdate={onSubmit} user={user} users={users} />;
};

export default SetupPage;
