import { z } from "zod";
import { createTRPCRouter, sessionProcedure } from "../trpc";
import { createUser } from "../services/account";
import { UserVacation } from "model/src/vacation";

export const accountRouter = createTRPCRouter({
  createAccount: sessionProcedure
    .input(z.object({ account: z.object({ name: z.string() }) }))
    .mutation(({ input, ctx }) => {
      const user: UserVacation = {
        name: input.account.name,
        groupIds: [],
        groups: [],
        events: [],
        eventIds: [],
        id: "",
        createdByEvents: [],
        dependents: [],
      };
      return createUser(user, ctx.session);
    }),
});
