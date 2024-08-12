import { redirect } from "next/navigation";
import { Home } from "./home";
import { getVacationEvents } from "api/src/repositories/event";
import { prisma } from "db/lib/prisma";
import { requireUserVacation } from "../utils/protected-routes-hoc";
import { getUserVactions } from "api/src/repositories/user-vacation";
import { SignInButton } from "@clerk/nextjs";
import { requireAuth } from "next-utils/src/utils/protected-routes-hoc";

export default async function HomePage() {
  const auth = await requireAuth()();
  if (auth.redirect) {
    return <SignInButton />;
  }

  const result = await requireUserVacation()();
  if (result.redirect) {
    redirect(result.redirect);
  }

  const events = await getVacationEvents({ db: prisma });

  const users = await getUserVactions();
  return <Home events={events} users={users} />;
}
