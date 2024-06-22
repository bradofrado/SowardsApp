import { redirect } from "next/navigation";
import { Badge } from "ui/src/components/catalyst/badge";
import { Divider } from "ui/src/components/catalyst/divider";
import { Home } from "./home";
import { getUser } from "./plan/actions";
import { getVacationEvents } from "api/src/repositories/event";
import { prisma } from "db/lib/prisma";
import { requireUserVacation } from "../utils/protected-routes-hoc";
import { UserProvider } from "./plan/components/user-provider";

export default async function HomePage() {
  const result = await requireUserVacation()();
  if (result.redirect) {
    redirect(result.redirect);
  }

  const events = await getVacationEvents({ db: prisma });

  const session = result.session;
  return (
    <UserProvider
      getUser={getUser}
      isAdmin={false}
      user={session?.auth.userVacation}
    >
      <Home events={events} />
    </UserProvider>
  );
}
