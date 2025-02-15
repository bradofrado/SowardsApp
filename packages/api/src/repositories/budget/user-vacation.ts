import type { Db, Prisma } from "db/lib/prisma";
import type { Budget } from "model/src/budget";
import { budgetPayload, prismaToBudget } from "./template/budget-template";

export interface UserVacationWithBudgets {
  id: string;
  name: string;
  budgets: Budget[];
}

export const userVacationBudgetPayload = {
  include: {
    budgets: {
      ...budgetPayload,
    },
  },
} satisfies Prisma.UserVacationDefaultArgs;

export const getAllActiveUserVacations = async (
  db: Db,
): Promise<UserVacationWithBudgets[]> => {
  const users = await db.userVacation.findMany({
    ...userVacationBudgetPayload,
  });

  return users.map(prismaToUserVacation);
};

export const prismaToUserVacation = (
  user: Prisma.UserVacationGetPayload<typeof userVacationBudgetPayload>,
): UserVacationWithBudgets => {
  return {
    ...user,
    budgets: user.budgets.map(prismaToBudget),
  };
};
