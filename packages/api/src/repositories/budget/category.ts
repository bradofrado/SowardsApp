import type { Prisma } from "db/lib/generated/client";
import type { Db } from "db/lib/prisma";
import type { CategoryBudget } from "model/src/budget";

export const getCategories = async ({
  db,
  userId,
}: {
  db: Db;
  userId: string;
}): Promise<CategoryBudget[]> => {
  const categories = await db.budgetCategory.findMany({
    where: {
      userId,
    },
    orderBy: {
      order: "asc",
    },
  });
  return categories.map(prismaToBudgetCategory);
};

export const createCategory = async ({
  category,
  db,
  userId,
}: {
  category: CategoryBudget;
  db: Db;
  userId: string;
}): Promise<CategoryBudget> => {
  const newCategory = await db.budgetCategory.create({
    data: {
      userId,
      name: category.name,
      type: category.type,
      order: category.order,
    },
  });
  return prismaToBudgetCategory(newCategory);
};

export const createCategories = async ({
  categories,
  db,
  userId,
}: {
  categories: CategoryBudget[];
  db: Db;
  userId: string;
}): Promise<void> => {
  const currCategories = await getCategories({ db, userId });
  await Promise.all(
    categories.map(async (category) => {
      if (category.id && !category.id.startsWith("cat-")) {
        return updateCategory({ category, db });
      }

      return createCategory({ category, db, userId });
    }),
  );

  // Delete categories that are no longer in the list
  await Promise.all(
    currCategories.map(async (category) => {
      if (!categories.find((c) => c.id === category.id)) {
        await deleteCategory({ db, id: category.id });
      }
    }),
  );
};

export const updateCategory = async ({
  category,
  db,
}: {
  category: CategoryBudget;
  db: Db;
}): Promise<CategoryBudget> => {
  const updatedCategory = await db.budgetCategory.update({
    where: {
      id: category.id,
    },
    data: {
      name: category.name,
      type: category.type,
      order: category.order,
    },
  });
  return prismaToBudgetCategory(updatedCategory);
};

export const deleteCategory = async ({
  db,
  id,
}: {
  db: Db;
  id: string;
}): Promise<void> => {
  await db.budgetCategory.delete({
    where: {
      id,
    },
  });
};

export const prismaToBudgetCategory = (
  category: Prisma.BudgetCategoryGetPayload<true>,
): CategoryBudget => {
  return {
    id: category.id,
    name: category.name,
    type: category.type as "income" | "expense", // | "transfer",
    order: category.order,
  };
};
