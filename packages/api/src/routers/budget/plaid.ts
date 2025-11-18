import { z } from "zod";
import { spendingRecordSchema } from "model/src/budget";
import {
  createLinkToken,
  setAccessToken,
} from "../../repositories/budget/plaid";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { addExternalLogin } from "../../repositories/budget/external-login";
import {
  createSpendingRecord,
  deleteSpendingRecord,
  updateSpendingRecord,
} from "../../repositories/budget/spending";
import { removeExternalLogin } from "../../services/external-login";

export const plaidRouter = createTRPCRouter({
  createLinkToken: protectedProcedure
    .input(z.object({ accessToken: z.optional(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const linkToken = await createLinkToken(
        ctx.session.auth.userVacation.id,
        input.accessToken,
      );

      return linkToken;
    }),
  setAccessToken: protectedProcedure
    .input(z.object({ publicToken: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { publicToken } = input;
      const { accessToken, itemId } = await setAccessToken(publicToken);

      const newLogin = await addExternalLogin({
        db: ctx.prisma,
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
    .mutation(async ({ input, ctx }) => {
      await removeExternalLogin({
        accessToken: input.accessToken,
        db: ctx.prisma,
      });
    }),
  updateTransactions: protectedProcedure
    .input(z.object({ transactions: z.array(spendingRecordSchema) }))
    .mutation(async ({ input, ctx }) => {
      await Promise.all(
        input.transactions.map(async (transaction) => {
          await updateSpendingRecord({
            db: ctx.prisma,
            spendingRecord: transaction,
            userId: ctx.session.auth.userVacation.id,
          });
        }),
      );
    }),
  saveTransaction: protectedProcedure
    .input(z.object({ transaction: spendingRecordSchema }))
    .mutation(async ({ input, ctx }) => {
      await createSpendingRecord({
        db: ctx.prisma,
        spendingRecord: input.transaction,
        userId: ctx.session.auth.userVacation.id,
      });
    }),
  updateTransaction: protectedProcedure
    .input(z.object({ transaction: spendingRecordSchema }))
    .mutation(async ({ input, ctx }) => {
      await updateSpendingRecord({
        db: ctx.prisma,
        spendingRecord: input.transaction,
        userId: ctx.session.auth.userVacation.id,
      });
    }),
  deleteTransaction: protectedProcedure
    .input(z.object({ transactionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await deleteSpendingRecord({
        db: ctx.prisma,
        transactionId: input.transactionId,
      });
    }),
});
