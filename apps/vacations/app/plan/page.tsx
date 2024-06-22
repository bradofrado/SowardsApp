import { prisma } from "db/lib/prisma";
import { getVacationEvents } from "api/src/repositories/event";
import { getGroups } from "api/src/repositories/group";
import { redirect } from "next/navigation";
import { getUserVactions } from "api/src/repositories/user-vacation";
import { requireUserVacation } from "../../utils/protected-routes-hoc";
import { StatsView } from "./components/stats-view";
import { CalendarView } from "./components/calendar-view";
import { UserProvider } from "./components/user-provider";
import { UserToggle } from "./components/user-toggle";
import { getUser } from "./actions";
import { Heading, Subheading } from "ui/src/components/catalyst/heading";

const PlanPage = async (): Promise<JSX.Element> => {
  const result = await requireUserVacation()();
  if (result.redirect) {
    redirect(result.redirect);
  }

  const events = await getVacationEvents({ db: prisma });
  const groups = await getGroups({ db: prisma });
  const users = await getUserVactions();

  const session = result.session;
  const isAdmin = session?.auth.user.roles.includes("admin") || false;
  return (
    <UserProvider
      getUser={getUser}
      isAdmin={false}
      user={session?.auth.userVacation}
    >
      <Heading>Events</Heading>
      <div className="mt-8 flex items-end justify-between">
        <Subheading>Budget</Subheading>
      </div>
      <StatsView events={events} groups={groups} />
      <div className="mt-5">
        <CalendarView
          events={events}
          role={session?.auth.user.roles[0] || "user"}
        />
      </div>
    </UserProvider>
  );
};

export default PlanPage;
