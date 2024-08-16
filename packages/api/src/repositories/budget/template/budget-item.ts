import type { Prisma } from "db/lib/prisma";
import type { BudgetItem } from "model/src/budget";
import { prismaToBudgetCategory } from "../category";

export const budgetItemPayload = {
  include: {
    category: true,
  },
} satisfies Prisma.BudgetItemDefaultArgs;

export const prismaToBudgetItem = (
  item: Prisma.BudgetItemGetPayload<typeof budgetItemPayload>,
): BudgetItem => {
  return {
    id: item.id,
    category: prismaToBudgetCategory(item.category),
    amount: item.amount,
    startDate: item.startDate,
    endDate: item.endDate,
  };
};
