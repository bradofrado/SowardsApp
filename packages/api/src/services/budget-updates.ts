/* eslint-disable no-await-in-loop -- ok*/
import type { Db } from "db/lib/prisma";
import { getCadenceStartAndEnd } from "model/src/budget";
import { isDateInBetween } from "model/src/utils";
import { getCategories } from "../repositories/budget/category";
import { createBudgetItem } from "../repositories/budget/template/budget-item";
import type { UserVacationWithBudgets } from "../repositories/budget/user-vacation";
import { makeExpenseTransaction } from "./budget";

export const updateExpiredBudgets = async (
  db: Db,
  userVacation: UserVacationWithBudgets,
): Promise<number> => {
  return db.$transaction(
    async (tx) => {
      const categories = await getCategories({
        db: tx,
        userId: userVacation.id,
      });

      let createdCount = 0;
      // Process budgets sequentially to avoid race conditions
      for (const budget of userVacation.budgets) {
        for (const category of categories) {
          const budgetItem = budget.items.find(
            (item) => item.category.id === category.id,
          );
          const budgetItemNotExpired = budget.items.find(
            (item) =>
              item.category.id === category.id &&
              isDateInBetween(new Date(), item.periodStart, item.periodEnd),
          );

          if (budgetItem && budgetItemNotExpired === undefined) {
            const { periodStart, periodEnd } = getCadenceStartAndEnd(
              budgetItem.cadence,
            );

            await createBudgetItem({
              db: tx,
              budgetId: budget.id,
              item: {
                ...budgetItem,
                amount: budgetItem.targetAmount,
                periodStart,
                periodEnd,
              },
            });
            createdCount++;
          }
        }
      }

      return createdCount;
    },
    { timeout: 10000 },
  );
};

export const processAutomatedTransfers = async (
  db: Db,
  userVacation: UserVacationWithBudgets,
): Promise<number> => {
  const today = new Date();
  return db.$transaction(async (tx) => {
    let processedCount = 0;
    const budgetItems = userVacation.budgets
      .flatMap((budget) => budget.items)
      .filter(
        (item) =>
          item.category.type === "expense" &&
          isDateInBetween(today, item.periodStart, item.periodEnd),
      );

    // Process transfers sequentially to avoid race conditions
    for (const item of budgetItems) {
      if (item.cadenceAmount <= 0) continue;

      // If targetAmount is 0, transfer the full cadenceAmount
      // Otherwise, transfer the minimum of cadenceAmount and remaining amount needed
      const transferAmount =
        item.targetAmount === 0
          ? item.cadenceAmount
          : Math.min(item.cadenceAmount, item.targetAmount - item.amount);

      if (transferAmount <= 0) continue;

      await makeExpenseTransaction({
        db: tx,
        from: undefined,
        to: item,
        amount: transferAmount,
        date: new Date(),
      });
      processedCount++;
    }

    return processedCount;
  });
};
