import type { Db, Prisma } from "db/lib/prisma";
import type { Budget } from "model/src/budget";
import { budgetItemPayload, prismaToBudgetItem } from "./budget-item";

const budgetPayload = {
  include: {
    budgetItems: {
      ...budgetItemPayload,
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
              amount: item.amount,
              categoryId: item.category.id,
              startDate: item.startDate,
              endDate: item.endDate,
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
  return prismaToBudget(
    await db.budgetTemplate.update({
      where: {
        id: budget.id,
      },
      data: {
        name: budget.name,
        budgetItems: {
          deleteMany: {},
          createMany: {
            data: budget.items.map((item) => ({
              amount: item.amount,
              categoryId: item.category.id,
              startDate: item.startDate,
              endDate: item.endDate,
            })),
          },
        },
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
