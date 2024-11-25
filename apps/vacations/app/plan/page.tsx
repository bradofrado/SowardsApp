import { prisma } from "db/lib/prisma";
import { getVacationEvents } from "api/src/repositories/event";
import { getGroups } from "api/src/repositories/group";
import { redirect } from "next/navigation";
import { Heading, Subheading } from "ui/src/components/catalyst/heading";
import { getUserVactions } from "api/src/repositories/user-vacation";
import { requireUserVacation } from "../../utils/protected-routes-hoc";
import { StatsView } from "./components/stats-view";
import { CalendarView } from "./components/calendar-view";
import { ItineraryButton } from "./components/itinerary-button";
import { generateItinerary } from "./actions";

const PlanPage = async (): Promise<JSX.Element> => {
  const result = await requireUserVacation()();
  if (result.redirect) {
    redirect(result.redirect);
  }

  const events = await getVacationEvents({ db: prisma });
  const groups = await getGroups({ db: prisma });
  const users = await getUserVactions();

  const session = result.session;
  return (
    <>
      <Heading>Events</Heading>
      <div className="mt-8 flex items-end justify-between">
        <Subheading>Budget</Subheading>
      </div>
      <StatsView events={events} groups={groups} />
      <div className="mt-5">
        <ItineraryButton generateItinerary={generateItinerary} />
        <CalendarView
          events={events}
          roles={session?.auth.user.roles || []}
          users={users}
        />
      </div>
    </>
  );
};

export default PlanPage;
