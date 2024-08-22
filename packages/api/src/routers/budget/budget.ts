import { z } from "zod";
import { budgetSchema, categoryBudgetSchema } from "model/src/budget";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import {
  createCategories,
  createCategory,
} from "../../repositories/budget/category";
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
      const newCategories = await Promise.all(
        input.budget.items.map((item) =>
          item.category.id.includes("cat")
            ? createCategory({
                category: item.category,
                db: ctx.prisma,
                userId: ctx.session.auth.userVacation.id,
              })
            : Promise.resolve(item.category),
        ),
      );

      return await ctx.prisma.budgetTemplate.create({
        data: {
          name: input.budget.name,
          budgetItems: {
            createMany: {
              data: input.budget.items.map((item, index) => ({
                amount: item.amount,
                categoryId: newCategories[index].id,
                cadence: item.cadence,
              })),
            },
          },
          user: {
            connect: {
              id: ctx.session.auth.userVacation.id,
            },
          },
        },
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
