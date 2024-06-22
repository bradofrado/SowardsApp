import { getUserVactions } from "api/src/repositories/user-vacation";
import type { UserVacation } from "model/src/vacation";
import { getAuthSession } from "../../utils/auth";
import { UserProvider } from "../plan/components/user-provider";
import { getUser } from "../plan/actions";
import { updateUser } from "./components/actions";
import { ConnectAccountForm } from "./components/connect-account-form";

const SetupPage = async (): Promise<JSX.Element> => {
  const session = await getAuthSession();
  const onSubmit = updateUser;
  const user: UserVacation = session?.auth.userVacation || {
    id: "",
    name: "New Family",
    createdByEvents: [],
    dependents: [],
    eventIds: [],
    events: [],
    groupIds: [],
    groups: [],
  };
  const users = await getUserVactions();
  const isAdmin = session?.auth.user.roles.includes("admin") || false;
  return (
    <UserProvider getUser={getUser} isAdmin={isAdmin} user={user}>
      <ConnectAccountForm onUpdate={onSubmit} user={user} users={users} />
    </UserProvider>
  );
};

export default SetupPage;
