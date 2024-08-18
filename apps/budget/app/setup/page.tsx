import { withAuth } from "next-utils/src/utils/protected-routes-hoc";
import { WelcomeModal } from "./welcome-modal";
import { getExternalLogins } from "api/src/services/budget";

const SetupPage = withAuth(async ({ ctx }) => {
  const accounts = await getExternalLogins(ctx.session.auth.userVacation.id);
  return <WelcomeModal show={true} accounts={accounts} />;
});

export default SetupPage;
