import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { categoryBudgetSchema } from "model/src/budget";
import { createCategories } from "../../repositories/budget/category";

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
});
