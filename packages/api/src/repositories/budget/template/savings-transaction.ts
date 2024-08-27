import { Db, Prisma } from "db/lib/prisma";
import { SavingsTransaction } from "model/src/budget";
import { budgetItemPayload, prismaToBudgetItem } from "./budget-item";
import { prismaToSavingsGoal, savingsGoalPayload } from "./savings-goal";

export const savingsTransactionPayload = {
  include: {
    budget: budgetItemPayload,
    savingsGoal: savingsGoalPayload,
  },
} satisfies Prisma.SavingsTransactionDefaultArgs;

export const prismaToSavingsTransaction = (
  item: Prisma.SavingsTransactionGetPayload<typeof savingsTransactionPayload>,
): SavingsTransaction => {
  return {
    id: item.id,
    amount: item.amount,
    budgetItem: item.budget ? prismaToBudgetItem(item.budget) : undefined,
    savingsGoal: item.savingsGoal
      ? prismaToSavingsGoal(item.savingsGoal)
      : undefined,
    description: item.description,
    date: item.date,
  };
};

export const createSavingsTransaction = async ({
  db,
  input,
  userId,
}: {
  db: Db;
  input: SavingsTransaction;
  userId: string;
}): Promise<SavingsTransaction> => {
  const newTransaction = await db.savingsTransaction.create({
    data: {
      amount: input.amount,
      description: input.description,
      date: input.date,
      budget: input.budgetItem
        ? {
            connect: {
              id: input.budgetItem.id,
            },
          }
        : undefined,
      savingsGoal: input.savingsGoal
        ? {
            connect: {
              id: input.savingsGoal.id,
            },
          }
        : undefined,
      user: {
        connect: {
          id: userId,
        },
      },
    },
    ...savingsTransactionPayload,
  });

  return prismaToSavingsTransaction(newTransaction);
};
