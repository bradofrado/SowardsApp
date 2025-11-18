import { z } from "zod";
import {
  createRecipeSchema,
  updateRecipeSchema,
  createRecipeCategorySchema,
} from "model/src/recipe";
import type { Prisma } from "db/lib/prisma";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { RecipeScraper } from "../services/recipe/scrape-website";

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

  scrapeRecipeFromUrl: protectedProcedure
    .input(
      z.object({
        url: z.string().url(),
        categoryId: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const scraper = new RecipeScraper();
      const scrapedRecipe = await scraper.scrapeRecipe(input.url);

      if (!scrapedRecipe) {
        throw new Error("Failed to scrape recipe from URL");
      }

      // Parse time strings (e.g., "PT15M" to 15)
      const parseIsoTime = (isoTime?: string): number | undefined => {
        if (!isoTime) return undefined;
        // eslint-disable-next-line prefer-named-capture-group -- ok
        const regex = /PT(\d+)M/;
        const match = regex.exec(isoTime);
        return match?.[1] ? parseInt(match[1]) : undefined;
      };

      // Parse servings from various formats
      const parseServings = (servings?: string): number | undefined => {
        if (!servings) return undefined;
        const regex = /\d+/;
        const match = regex.exec(servings);
        return match?.[0] ? parseInt(match[0]) : undefined;
      };

      return ctx.prisma.recipe.create({
        data: {
          title: scrapedRecipe.title,
          description: scrapedRecipe.description,
          prepTime: parseIsoTime(scrapedRecipe.prepTime),
          cookTime: parseIsoTime(scrapedRecipe.cookTime),
          servings: parseServings(scrapedRecipe.recipeYield),
          ingredients: scrapedRecipe.ingredients,
          instructions: scrapedRecipe.instructions,
          notes: scrapedRecipe.keywords?.join(", "),
          imageUrl: scrapedRecipe.image,
          sourceUrl: input.url,
          isPublic: true,
          categoryId: input.categoryId,
          userId: ctx.session.auth.userVacation.id,
        },
        include: {
          category: true,
        },
      });
    }),
});
