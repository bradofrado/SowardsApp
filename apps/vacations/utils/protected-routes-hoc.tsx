import { requireRoute } from "next-utils/src/protected-routes-hoc";

export const requireUserVacation = requireRoute({
  redirect: "/settings",
  check: (session) => Boolean(session && !session.auth.userVacation),
});
