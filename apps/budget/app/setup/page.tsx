import { withAuth } from "next-utils/src/utils/protected-routes-hoc";
import { WelcomeModal } from "./welcome-modal";
import { getExternalLogins } from "api/src/services/budget";
import { SetupStepper } from "./components/setup-stepper";

const SetupPage = withAuth(async ({ ctx }) => {
  const accounts = await getExternalLogins(ctx.session.auth.userVacation.id);
  return <SetupStepper accounts={accounts} />;
});

export default SetupPage;
