import { z } from "zod";

export const recipeCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
});

export type RecipeCategory = z.infer<typeof recipeCategorySchema>;

export const recipeSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  prepTime: z.number().nullable().optional(),
  cookTime: z.number().nullable().optional(),
  servings: z.number().nullable().optional(),
  ingredients: z.array(z.string()),
  instructions: z.array(z.string()),
  notes: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  sourceUrl: z.string().nullable().optional(),
  isPublic: z.boolean().default(true),
  categoryId: z.string().nullable().optional(),
  category: recipeCategorySchema.nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Recipe = z.infer<typeof recipeSchema>;

export const createRecipeSchema = recipeSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  category: true,
});

export type CreateRecipe = z.infer<typeof createRecipeSchema>;

export const updateRecipeSchema = recipeSchema
  .omit({
    createdAt: true,
    updatedAt: true,
    category: true,
  })
  .partial()
  .required({ id: true });

export type UpdateRecipe = z.infer<typeof updateRecipeSchema>;

export const createRecipeCategorySchema = recipeCategorySchema.omit({
  id: true,
});

export type CreateRecipeCategory = z.infer<typeof createRecipeCategorySchema>;
