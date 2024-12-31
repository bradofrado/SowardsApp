import { z } from "zod";
import {
  budgetItemSchema,
  budgetSchema,
  categoryBudgetSchema,
} from "model/src/budget";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import {
  createCategories,
  createCategory,
} from "../../repositories/budget/category";
import {
  deleteBudget,
  updateBudget,
} from "../../repositories/budget/template/budget-template";
import { createBudget, makeExpenseTransaction } from "../../services/budget";

export const budgetRouter = createTRPCRouter({
  createCategories: protectedProcedure
    .input(z.object({ categories: z.array(categoryBudgetSchema) }))
    .mutation(async ({ input, ctx }) => {
      await createCategories({
        db: ctx.prisma,
        categories: input.categories,
        userId: ctx.session.auth.userVacation.id,
      });
    }),
  createCategory: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        type: z.union([z.literal("income"), z.literal("expense")]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const currCategories = await ctx.prisma.budgetCategory.findMany({
        where: {
          userId: ctx.session.auth.userVacation.id,
        },
      });

      return createCategory({
        db: ctx.prisma,
        category: {
          id: "",
          name: input.name,
          type: input.type,
          order: currCategories.length,
        },
        userId: ctx.session.auth.userVacation.id,
      });
    }),

  createBudget: protectedProcedure
    .input(z.object({ budget: budgetSchema }))
    .mutation(async ({ input, ctx }) => {
      return createBudget({
        budget: input.budget,
        userId: ctx.session.auth.userVacation.id,
        db: ctx.prisma,
      });
    }),

  updateBudget: protectedProcedure
    .input(z.object({ budget: budgetSchema }))
    .mutation(({ input, ctx }) => {
      return updateBudget({
        db: ctx.prisma,
        budget: input.budget,
      });
    }),
  deleteBudget: protectedProcedure
    .input(z.object({ budgetId: z.string() }))
    .mutation(({ input, ctx }) => {
      return deleteBudget({
        db: ctx.prisma,
        budgetId: input.budgetId,
      });
    }),
  transferFunds: protectedProcedure
    .input(
      z.object({
        transfers: z.array(
          z.object({
            from: z.optional(budgetItemSchema),
            to: budgetItemSchema,
            amount: z.number(),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await Promise.all(
        input.transfers.map(({ from, to, amount }) =>
          makeExpenseTransaction({
            db: ctx.prisma,
            from,
            to,
            amount,
          }),
        ),
      );
    }),
});
