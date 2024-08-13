import type { Prisma } from "db/lib/generated/client";
import type { Db } from "db/lib/prisma";
import type { CategoryBudget } from "model/src/budget";

export const getCategories = async ({
  db,
}: {
  db: Db;
}): Promise<CategoryBudget[]> => {
  const categories = await db.budgetCategory.findMany({
    orderBy: {
      order: "asc",
    },
  });
  return categories.map(prismaToBudgetCategory);
};

export const createCategory = async ({
  category,
  db,
}: {
  category: CategoryBudget;
  db: Db;
}): Promise<CategoryBudget> => {
  const newCategory = await db.budgetCategory.create({
    data: {
      name: category.name,
      type: category.type === "income" ? "income" : "expense",
      order: category.order,
    },
  });
  return prismaToBudgetCategory(newCategory);
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
      type: category.type === "income" ? "income" : "expense",
      order: category.order,
    },
  });
  return prismaToBudgetCategory(updatedCategory);
};

export const prismaToBudgetCategory = (
  category: Prisma.BudgetCategoryGetPayload<true>,
): CategoryBudget => {
  return {
    id: category.id,
    name: category.name,
    type: category.type === "income" ? "income" : "expense",
    order: category.order,
  };
};
