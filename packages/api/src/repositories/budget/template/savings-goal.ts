import type { Db, Prisma } from "db/lib/prisma";
import type { SavingsGoal } from "model/src/budget";
import { prismaToBudgetCategory } from "../category";

export const savingsGoalPayload = {
  include: {
    category: true,
  },
} satisfies Prisma.SavingsGoalDefaultArgs;

export const prismaToSavingsGoal = (
  item: Prisma.SavingsGoalGetPayload<typeof savingsGoalPayload>,
): SavingsGoal => {
  return {
    id: item.id,
    category: prismaToBudgetCategory(item.category),
    amount: item.amount,
    targetAmount: item.targetAmount,
    totalSaved: item.totalSaved,
  };
};

export const getSavingsGoals = async ({
  db,
  userId,
}: {
  db: Db;
  userId: string;
}): Promise<SavingsGoal[]> => {
  const savingsGoals = await db.savingsGoal.findMany({
    where: {
      budget: {
        userId,
      },
    },
    ...savingsGoalPayload,
  });

  return savingsGoals.map(prismaToSavingsGoal);
};

export const updateSavingsAmount = async ({
  db,
  savingsId,
  newAmount,
}: {
  db: Db;
  savingsId: string;
  newAmount: number;
}): Promise<void> => {
  await db.savingsGoal.update({
    where: {
      id: savingsId,
    },
    data: {
      totalSaved: newAmount,
    },
  });
};
