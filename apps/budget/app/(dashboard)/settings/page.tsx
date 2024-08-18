import { getUserVactions } from "api/src/repositories/user-vacation";
import type { UserVacation } from "model/src/vacation";
import { SignInButton } from "@clerk/nextjs";
import {
  AuthProps,
  requireAuth,
  withAuth,
} from "next-utils/src/utils/protected-routes-hoc";
import { getAuthSession } from "next-utils/src/utils/auth";
import { updateUser } from "next-utils/src/actions/settings";
import { ConnectAccountForm } from "ui/src/components/feature/settings/connect-account-form";
import { getExternalLogins } from "api/src/services/budget";
import { ConnectExternalAccountForm } from "../../../utils/components/totals/connect-external-form";
import { redirect } from "next/navigation";

const SetupPage = withAuth(async ({ ctx }): Promise<JSX.Element> => {
  const auth = await requireAuth()();
  if (auth.redirect) {
    return <SignInButton />;
  }

  const accounts = await getExternalLogins(ctx.session.auth.userVacation.id);

  if (accounts.length === 0) {
    redirect("/setup");
  }

  const onSubmit = updateUser;
  const userVacation: UserVacation = ctx.session.auth.userVacation;
  const users = await getUserVactions();

  return (
    <>
      <ConnectAccountForm
        onUpdate={onSubmit}
        userVacation={userVacation}
        user={ctx.session.auth.user}
        users={users}
      />
      <ConnectExternalAccountForm accounts={accounts} />
    </>
  );
});

export default SetupPage;
