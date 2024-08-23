import type { Db, Prisma } from "db/lib/prisma";
import type { BudgetItem, CategoryBudget } from "model/src/budget";
import { prismaToBudgetCategory } from "../category";
import { budgetCadenceSchema } from "model/src/budget";

export const budgetItemPayload = {
  include: {
    category: true,
  },
} satisfies Prisma.BudgetItemDefaultArgs;

export const getBudgetItemsOfType = async ({
  db,
  userId,
  type,
}: {
  db: Db;
  userId: string;
  type: CategoryBudget["type"];
}): Promise<BudgetItem[]> => {
  const items = await db.budgetItem.findMany({
    where: {
      category: {
        type,
      },
      budget: {
        userId,
      },
    },
    ...budgetItemPayload,
  });

  return items.map(prismaToBudgetItem);
};

export const prismaToBudgetItem = (
  item: Prisma.BudgetItemGetPayload<typeof budgetItemPayload>,
): BudgetItem => {
  return {
    id: item.id,
    category: prismaToBudgetCategory(item.category),
    amount: item.amount,
    cadence: budgetCadenceSchema.parse(item.cadence),
  };
};
