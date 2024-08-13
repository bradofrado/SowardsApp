"use server";
import { CategoryBudget } from "model/src/budget";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "api/src/repositories/budget/category";
import { prisma } from "db/lib/prisma";

export const saveCategories = async (
  categories: CategoryBudget[],
): Promise<void> => {
  const currCategories = await getCategories({ db: prisma });
  await Promise.all(
    categories.map(async (category) => {
      if (category.id && !category.id.startsWith("cat-")) {
        return updateCategory({ category, db: prisma });
      }

      return createCategory({ category, db: prisma });
    }),
  );

  // Delete categories that are no longer in the list
  await Promise.all(
    currCategories.map(async (category) => {
      if (!categories.find((c) => c.id === category.id)) {
        await deleteCategory({ db: prisma, id: category.id });
      }
    }),
  );
};
