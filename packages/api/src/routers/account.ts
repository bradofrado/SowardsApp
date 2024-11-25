import { z } from "zod";
import type { UserVacation } from "model/src/vacation";
import {
  createTRPCRouter,
  protectedProcedure,
  sessionProcedure,
} from "../trpc";
import { createUser } from "../services/account";
import { updateUserVacation } from "../repositories/user-vacation";

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
  updateAccount: protectedProcedure
    .input(z.object({ account: z.object({ name: z.string() }) }))
    .mutation(({ input, ctx }) => {
      return updateUserVacation({
        ...ctx.session.auth.userVacation,
        name: input.account.name,
      });
    }),
});
