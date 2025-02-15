import type { DbTransaction, Prisma } from "db/lib/prisma";
import type { BudgetItem, CategoryBudget } from "model/src/budget";
import { budgetCadenceSchema } from "model/src/budget";
import { prismaToBudgetCategory } from "../category";

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
  db: DbTransaction;
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

export const createBudgetItem = async ({
  db,
  item,
  budgetId,
}: {
  db: DbTransaction;
  item: BudgetItem;
  budgetId: string;
}): Promise<BudgetItem> => {
  const newItem = await db.budgetItem.create({
    data: {
      amount: item.amount,
      targetAmount: item.targetAmount,
      periodStart: item.periodStart,
      periodEnd: item.periodEnd,
      cadence: item.cadence,
      cadenceAmount: item.cadenceAmount,
      category: {
        connect: {
          id: item.category.id,
        },
      },
      budget: {
        connect: {
          id: budgetId,
        },
      },
    },
    ...budgetItemPayload,
  });

  return prismaToBudgetItem(newItem);
};

export const prismaToBudgetItem = (
  item: Prisma.BudgetItemGetPayload<typeof budgetItemPayload>,
): BudgetItem => {
  return {
    id: item.id,
    category: prismaToBudgetCategory(item.category),
    amount: item.amount,
    targetAmount: item.targetAmount,
    periodStart: item.periodStart,
    periodEnd: item.periodEnd,
    cadence: budgetCadenceSchema.parse(item.cadence),
    cadenceAmount: item.cadenceAmount,
  };
};

export const updateBudgetItemAmount = async ({
  db,
  itemId,
  amount,
}: {
  db: DbTransaction;
  itemId: string;
  amount: number;
}) => {
  await db.budgetItem.update({
    where: {
      id: itemId,
    },
    data: {
      amount,
    },
  });
};
