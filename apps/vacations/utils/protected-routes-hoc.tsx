import { requireRoute } from "next-utils/src/utils/protected-routes-hoc";

export const requireUserVacation = requireRoute({
  redirect: "/setup",
  check: (session) => Boolean(session && !session.auth.userVacation),
});
