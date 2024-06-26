import { getUserVactions } from "api/src/repositories/user-vacation";
import type { UserVacation } from "model/src/vacation";
import { getAuthSession } from "../../utils/auth";
import { updateUser } from "./components/actions";
import { ConnectAccountForm } from "./components/connect-account-form";
import { SignInButton } from "@clerk/nextjs";
import { requireAuth } from "../../utils/protected-routes-hoc";

const SetupPage = async (): Promise<JSX.Element> => {
  const auth = await requireAuth()();
  if (auth.redirect) {
    return <SignInButton />;
  }

  const session = await getAuthSession();
  const onSubmit = updateUser;
  const user: UserVacation | undefined = session?.auth.userVacation;
  const users = await getUserVactions();

  return <ConnectAccountForm onUpdate={onSubmit} user={user} users={users} />;
};

export default SetupPage;
