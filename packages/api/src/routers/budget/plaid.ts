import { z } from "zod";
import { spendingRecordSchema } from "model/src/budget";
import {
  createLinkToken,
  getAccounts,
  removeAccount,
  setAccessToken,
} from "../../repositories/budget/plaid";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import {
  addExternalLogin,
  deleteExternalLogin,
} from "../../repositories/budget/external-login";
import {
  createSpendingRecord,
  deleteSpendingRecord,
  deleteSpendingRecords,
  updateSpendingRecord,
} from "../../repositories/budget/spending";

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
      const accounts = await getAccounts({
        accessToken: input.accessToken,
        cursor: null,
      });
      await Promise.all(
        accounts.map((account) =>
          deleteSpendingRecords({
            db: ctx.prisma,
            accountId: account.account_id,
          }),
        ),
      );

      await deleteExternalLogin({
        db: ctx.prisma,
        accessToken: input.accessToken,
      });
      await removeAccount({ accessToken: input.accessToken });
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
