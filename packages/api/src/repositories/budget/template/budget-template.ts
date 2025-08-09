import type { Db, Prisma } from "db/lib/prisma";
import type { Budget, BudgetItem } from "model/src/budget";
import { budgetItemPayload, prismaToBudgetItem } from "./budget-item";

export const budgetPayload = {
  include: {
    budgetItems: {
      ...budgetItemPayload,
      orderBy: {
        periodStart: "desc",
      },
    },
  },
} satisfies Prisma.BudgetTemplateDefaultArgs;

export const getBudgets = async ({
  db,
  userId,
}: {
  db: Db;
  userId: string;
}): Promise<Budget[]> => {
  const budgets = await db.budgetTemplate.findMany({
    where: {
      userId,
    },
    ...budgetPayload,
  });

  return budgets.map(prismaToBudget);
};

export const getBudget = async ({
  db,
  budgetId,
}: {
  db: Db;
  budgetId: string;
}): Promise<Budget | null> => {
  const budget = await db.budgetTemplate.findFirst({
    where: {
      id: budgetId,
    },
    ...budgetPayload,
  });

  return budget ? prismaToBudget(budget) : null;
};

export const createBudget = async ({
  db,
  budget,
  userId,
}: {
  db: Db;
  budget: Budget;
  userId: string;
}): Promise<Budget> => {
  return prismaToBudget(
    await db.budgetTemplate.create({
      data: {
        user: {
          connect: {
            id: userId,
          },
        },
        name: budget.name,
        budgetItems: {
          createMany: {
            data: budget.items.map((item) => ({
              targetAmount: item.amount,
              amount: item.amount,
              cadenceAmount: item.cadenceAmount,
              categoryId: item.category.id,
              cadence: item.cadence,
              periodStart: item.periodStart,
              periodEnd: item.periodEnd,
            })),
          },
        },
      },
      ...budgetPayload,
    }),
  );
};

export const updateBudget = async ({
  db,
  budget,
}: {
  db: Db;
  budget: Budget;
}): Promise<Budget> => {
  const compare = (
    a: BudgetItem,
    b: Prisma.BudgetItemGetPayload<typeof budgetItemPayload>,
  ): boolean =>
    a.amount === b.amount &&
    a.targetAmount === b.targetAmount &&
    a.cadenceAmount === b.cadenceAmount &&
    JSON.stringify(a.cadence) === JSON.stringify(b.cadence) &&
    a.periodStart.getTime() === b.periodStart.getTime() &&
    a.periodEnd.getTime() === b.periodEnd.getTime() &&
    a.category.id === b.categoryId &&
    a.id === b.id;
  const existingItems = await db.budgetItem.findMany({
    where: {
      budget: {
        id: budget.id,
      },
    },
    ...budgetItemPayload,
  });

  const updateItems = budget.items.filter((item) => {
    const existingItem = existingItems.find(
      ({ id: updateId }) => updateId === item.id,
    );
    if (!existingItem) return false;
    return !compare(item, existingItem);
  });

  // In the budget form, we show all categories even if the user does not want it set
  // So we assume that if the target or amount is 0, the user does not want it in the budget
  const newItems = budget.items.filter(
    ({ id, targetAmount, amount }) =>
      !existingItems.find(({ id: updateId }) => updateId === id) &&
      (targetAmount > 0 || amount > 0),
  );
  const deleteItems = existingItems.filter(
    ({ id }) => !budget.items.find(({ id: updateId }) => updateId === id),
  );
  if (deleteItems.length) {
    await db.budgetItem.deleteMany({
      where: {
        id: {
          in: deleteItems.map(({ id }) => id),
        },
      },
    });
  }

  if (updateItems.length) {
    await Promise.all(
      updateItems.map((item) =>
        db.budgetItem.update({
          where: {
            id: item.id,
          },
          data: {
            targetAmount: item.targetAmount,
            amount: item.amount,
            cadenceAmount: item.cadenceAmount,
            categoryId: item.category.id,
            cadence: item.cadence,
            periodStart: item.periodStart,
            periodEnd: item.periodEnd,
          },
        }),
      ),
    );
  }

  if (newItems.length) {
    await db.budgetItem.createMany({
      data: newItems.map((item) => ({
        budgetId: budget.id,
        targetAmount: item.targetAmount,
        amount: item.amount,
        cadenceAmount: item.cadenceAmount,
        categoryId: item.category.id,
        cadence: item.cadence,
        periodStart: item.periodStart,
        periodEnd: item.periodEnd,
      })),
    });
  }

  return prismaToBudget(
    await db.budgetTemplate.update({
      where: {
        id: budget.id,
      },
      data: {
        name: budget.name,
      },
      ...budgetPayload,
    }),
  );
};

export const deleteBudget = async ({
  db,
  budgetId,
}: {
  db: Db;
  budgetId: string;
}): Promise<void> => {
  await db.budgetTemplate.delete({
    where: {
      id: budgetId,
    },
  });
};

export const prismaToBudget = (
  budget: Prisma.BudgetTemplateGetPayload<typeof budgetPayload>,
): Budget => {
  return {
    id: budget.id,
    name: budget.name,
    items: budget.budgetItems.map(prismaToBudgetItem),
  };
};
