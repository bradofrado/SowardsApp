import { z } from "zod";
import {
  createLinkToken,
  removeAccount,
  setAccessToken,
} from "../../repositories/budget/plaid";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import {
  addExternalLogin,
  deleteExternalLogin,
} from "../../repositories/budget/external-login";
import { prisma } from "db/lib/prisma";

export const plaidRouter = createTRPCRouter({
  createLinkToken: protectedProcedure.mutation(async ({ ctx }) => {
    const linkToken = await createLinkToken(ctx.session.auth.userVacation.id);

    return linkToken;
  }),
  setAccessToken: protectedProcedure
    .input(z.object({ publicToken: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { publicToken } = input;
      const { accessToken, itemId } = await setAccessToken(publicToken);

      const newLogin = await addExternalLogin({
        db: prisma,
        login: {
          accessToken,
          itemId,
          userId: ctx.session.auth.userVacation.id,
          cursor: null,
        },
      });

      return newLogin;
    }),
  removeAccount: protectedProcedure
    .input(z.object({ accessToken: z.string() }))
    .mutation(async ({ input }) => {
      await deleteExternalLogin({ db: prisma, accessToken: input.accessToken });
      await removeAccount(input.accessToken);
    }),
});
