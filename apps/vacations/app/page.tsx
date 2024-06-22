import { redirect } from "next/navigation";
import { Home } from "./home";
import { getVacationEvents } from "api/src/repositories/event";
import { prisma } from "db/lib/prisma";
import { requireUserVacation } from "../utils/protected-routes-hoc";
import { getUserVactions } from "api/src/repositories/user-vacation";

export default async function HomePage() {
  const result = await requireUserVacation()();
  if (result.redirect) {
    redirect(result.redirect);
  }

  const events = await getVacationEvents({ db: prisma });

  const users = await getUserVactions();
  return <Home events={events} users={users} />;
}
