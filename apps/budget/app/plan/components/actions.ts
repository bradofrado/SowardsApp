"use server";
import { CategoryBudget } from "model/src/budget";
import {
  createCategory,
  updateCategory,
} from "api/src/repositories/budget/category";
import { prisma } from "db/lib/prisma";

export const saveCategories = async (
  categories: CategoryBudget[],
): Promise<void> => {
  await Promise.all(
    categories.map(async (category) => {
      if (category.id && !category.id.startsWith("cat-")) {
        return updateCategory({ category, db: prisma });
      }

      return createCategory({ category, db: prisma });
    }),
  );
};
