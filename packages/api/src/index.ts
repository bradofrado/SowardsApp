import { accountRouter } from "./routers/account";
import { budgetRouter } from "./routers/budget/budget";
import { plaidRouter } from "./routers/budget/plaid";
import { vacationEventRouter } from "./routers/vacation/event";
import { vacationGroupRouter } from "./routers/vacation/group";
import { createTRPCRouter } from "./trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  vacationEvent: vacationEventRouter,
  vacationGroup: vacationGroupRouter,
  plaid: plaidRouter,
  budget: budgetRouter,
  account: accountRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
