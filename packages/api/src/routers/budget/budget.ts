import { z } from "zod";
import { budgetSchema, categoryBudgetSchema } from "model/src/budget";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { createCategories } from "../../repositories/budget/category";
import {
  createBudget,
  deleteBudget,
  updateBudget,
} from "../../repositories/budget/template/budget-template";

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

  createBudget: protectedProcedure
    .input(z.object({ budget: budgetSchema }))
    .mutation(({ input, ctx }) => {
      return createBudget({
        db: ctx.prisma,
        budget: input.budget,
        userId: ctx.session.auth.userVacation.id,
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
});