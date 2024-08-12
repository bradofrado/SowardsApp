import { getUserVactions } from "api/src/repositories/user-vacation";
import type { UserVacation } from "model/src/vacation";
import { SignInButton } from "@clerk/nextjs";
import { requireAuth } from "next-utils/src/utils/protected-routes-hoc";
import { getAuthSession } from "next-utils/src/utils/auth";
import { updateUser } from "next-utils/src/actions/settings";
import { ConnectAccountForm } from "next-utils/src/components/connect-account-form";

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
