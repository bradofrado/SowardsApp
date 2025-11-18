import { z } from "zod";
import {
  createRecipeSchema,
  updateRecipeSchema,
  createRecipeCategorySchema,
} from "model/src/recipe";
import type { Prisma } from "db/lib/prisma";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const recipeRouter = createTRPCRouter({
  // Category operations
  getCategories: protectedProcedure.query(async ({ ctx }) => {
    const results = await ctx.prisma.recipeCategory.findMany({
      where: {
        userId: ctx.session.auth.userVacation.id,
      },
      orderBy: {
        name: "asc",
      },
    });

    return results;
  }),

  createCategory: protectedProcedure
    .input(createRecipeCategorySchema)
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.recipeCategory.create({
        data: {
          name: input.name,
          description: input.description,
          icon: input.icon,
          userId: ctx.session.auth.userVacation.id,
        },
      });
    }),

  updateCategory: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().nullable().optional(),
        icon: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      return ctx.prisma.recipeCategory.update({
        where: {
          id,
          userId: ctx.session.auth.userVacation.id,
        },
        data,
      });
    }),

  deleteCategory: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.recipeCategory.delete({
        where: {
          id: input.id,
          userId: ctx.session.auth.userVacation.id,
        },
      });
    }),

  // Recipe operations
  getRecipes: protectedProcedure
    .input(
      z
        .object({
          categoryId: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ input, ctx }) => {
      const where: Prisma.RecipeWhereInput = {
        userId: ctx.session.auth.userVacation.id,
        isPublic: true,
      };

      if (input?.categoryId) {
        where.categoryId = input.categoryId;
      }

      return ctx.prisma.recipe.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),

  getRecipe: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      return ctx.prisma.recipe.findUnique({
        where: {
          id: input.id,
          userId: ctx.session.auth.userVacation.id,
        },
        include: {
          category: true,
        },
      });
    }),

  createRecipe: protectedProcedure
    .input(createRecipeSchema)
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.recipe.create({
        data: {
          title: input.title,
          description: input.description,
          prepTime: input.prepTime,
          cookTime: input.cookTime,
          servings: input.servings,
          ingredients: input.ingredients,
          instructions: input.instructions,
          notes: input.notes,
          imageUrl: input.imageUrl,
          isPublic: input.isPublic,
          categoryId: input.categoryId,
          userId: ctx.session.auth.userVacation.id,
        },
        include: {
          category: true,
        },
      });
    }),

  updateRecipe: protectedProcedure
    .input(updateRecipeSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      return ctx.prisma.recipe.update({
        where: {
          id,
          userId: ctx.session.auth.userVacation.id,
        },
        data,
        include: {
          category: true,
        },
      });
    }),

  deleteRecipe: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.recipe.delete({
        where: {
          id: input.id,
          userId: ctx.session.auth.userVacation.id,
        },
      });
    }),
});
