/* eslint-disable no-await-in-loop -- ok*/
import type { Db } from "db/lib/prisma";
import { prisma } from "db/lib/prisma";
import {
  getCadenceStartAndEnd,
  TransferCategory,
  type Budget,
  type BudgetItem,
  type SpendingRecord,
} from "model/src/budget";
import type { AccountBase, AccountType } from "plaid";
import {
  getLogins,
  updateExternalLoginCursor,
} from "../repositories/budget/external-login";
import { getAccounts, getTransactionsSync } from "../repositories/budget/plaid";
import type { LoginRequest } from "../repositories/budget/types";
import {
  createSpendingRecords,
  getSpendingRecords,
  getSpendingRecord,
  updateSpendingRecord,
  deleteSpendingRecord,
} from "../repositories/budget/spending";
import { createCategory, getCategories } from "../repositories/budget/category";
import { createTransferCategory } from "../repositories/budget/template/transfer-category";
import {
  budgetPayload,
  getBudgets as getBudgetsRepo,
  prismaToBudget,
} from "../repositories/budget/template/budget-template";
import {
  createBudgetItem,
  getBudgetItemsOfType,
  updateBudgetItemAmount,
} from "../repositories/budget/template/budget-item";
import { isDateInBetween } from "model/src/utils";

export const getExternalLogins = async (userId: string) => {
  return makeLoginRequest(userId, getAccounts);
};

export const getTransactions = async (
  userId: string,
): Promise<SpendingRecord[]> => {
  const allTransactionSync = await makeLoginRequest(
    userId,
    getTransactionsSync,
  );

  for (const transactionSync of allTransactionSync) {
    // Update login cursor
    await updateExternalLoginCursor({
      db: prisma,
      accessToken: transactionSync.accessToken,
      cursor: transactionSync.cursor,
    });

    // Add new transactions
    await createSpendingRecords({
      db: prisma,
      userId,
      spendingRecords: transactionSync.added.map((transaction) => ({
        transactionId: transaction.transaction_id,
        amount: transaction.amount,
        date: new Date(transaction.date),
        description: transaction.name,
        transactionCategories: [],
        accountId: transaction.account_id,
      })),
    });

    // Update modified transactions
    await Promise.all(
      transactionSync.modified.map(async (transaction) => {
        const modifiedRecord = await getSpendingRecord({
          db: prisma,
          transactionId: transaction.transaction_id,
        });

        if (!modifiedRecord) {
          return null;
        }

        return updateSpendingRecord({
          db: prisma,
          userId,
          spendingRecord: {
            ...modifiedRecord,
            amount: transaction.amount,
            date: new Date(transaction.date),
            description: transaction.name,
            accountId: transaction.account_id,
          },
        });
      }),
    );

    // Remove deleted transactions
    await Promise.all(
      transactionSync.removed.map(async (transaction) => {
        return deleteSpendingRecord({
          db: prisma,
          transactionId: transaction.transaction_id,
        });
      }),
    );
  }

  const spendingRecords = await getSpendingRecords({ db: prisma, userId });

  return spendingRecords;
};

export interface SpendingRecordWithAccountType extends SpendingRecord {
  accountType?: AccountType | "Savings"; // | "No Account";
}
export const getTransactionsWithAccounts = async (
  userId: string,
  cachedAccounts?: AccountBase[],
): Promise<SpendingRecordWithAccountType[]> => {
  const transactions = await getTransactions(userId);
  const accounts = cachedAccounts ?? (await getExternalLogins(userId));

  return transactions.map((transaction) => {
    const account = accounts.find(
      (_account) => _account.account_id === transaction.accountId,
    );

    const type = account?.type;

    return {
      ...transaction,
      accountType: type,
    };
  });
};

export const createBudget = async ({
  budget,
  db,
  userId,
}: {
  budget: Budget;
  db: Db;
  userId: string;
}) => {
  const newCategoriesItems = await Promise.all(
    budget.items.map((item) =>
      item.category.id.includes("cat")
        ? createCategory({
            category: item.category,
            db,
            userId,
          })
        : Promise.resolve(item.category),
    ),
  );
  // const newCategoriesGoals = await Promise.all(
  //   budget.goals.map((item) =>
  //     item.category.id.includes("cat")
  //       ? createCategory({
  //           category: item.category,
  //           db,
  //           userId,
  //         })
  //       : Promise.resolve(item.category),
  //   ),
  // );

  const budgetItems = budget.items.map((item, index) => ({
    ...item,
    category: newCategoriesItems[index],
  }));
  // const savingsGoals = budget.goals.map((item, index) => ({
  //   ...item,
  //   category: newCategoriesGoals[index],
  // }));

  const newBudget = await db.budgetTemplate.create({
    data: {
      name: budget.name,
      budgetItems: {
        createMany: {
          data: budgetItems.map((item) => ({
            amount: item.amount,
            targetAmount: item.targetAmount,
            cadenceAmount: item.cadenceAmount,
            periodStart: item.periodStart,
            periodEnd: item.periodEnd,
            categoryId: item.category.id,
            cadence: item.cadence,
          })),
        },
      },
      // savingsGoals: {
      //   createMany: {
      //     data: savingsGoals.map((item) => ({
      //       amount: item.amount,
      //       targetAmount: item.targetAmount,
      //       //The total saved is 0 because we will make a transfer to the savings account
      //       totalSaved: 0,
      //       categoryId: item.category.id,
      //       description: `${item.category.name} Savings Goal`,
      //     })),
      //   },
      // },
      user: {
        connect: {
          id: userId,
        },
      },
    },
    ...budgetPayload,
  });

  const modelBudget: Budget = prismaToBudget(newBudget);

  // await Promise.all(
  //   modelBudget.goals.map((item, i) =>
  //     makeSavingsTransaction({
  //       db,
  //       userId,
  //       item,
  //       amount: budget.goals[i].totalSaved,
  //     }),
  //   ),
  // );

  // await Promise.all(
  //   modelBudget.items.map((item, i) =>
  //     makeExpenseTransaction({
  //       db,
  //       item,
  //       amount: budget.items[i].amount,
  //     }),
  //   ),
  // );

  return newBudget;
};

export const getBudgets = async (userId: string): Promise<Budget[]> => {
  const budgets = await getBudgetsRepo({ db: prisma, userId });
  const categories = await getCategories({ db: prisma, userId });

  //Update the budget items if the period has expired
  await Promise.all(
    budgets.map(async (budget) => {
      for (const category of categories) {
        const budgetItem = budget.items.find(
          (item) => item.category.id === category.id,
        );
        //If there is a budget item for this category, but the period has expired, we need to create a new one
        if (
          budgetItem &&
          !budget.items.find(
            (item) =>
              item.category.id === category.id &&
              isDateInBetween(new Date(), item.periodStart, item.periodEnd),
          )
        ) {
          const { periodStart, periodEnd } = getCadenceStartAndEnd(
            budgetItem.cadence,
          );

          await createBudgetItem({
            db: prisma,
            budgetId: budget.id,
            item: {
              ...budgetItem,
              periodStart,
              periodEnd,
            },
          });
        }
      }
    }),
  );

  return budgets;
};

const checkExpenseTransfer = async (userId: string): Promise<BudgetItem[]> => {
  //Check if we need to make a savings transfer
  const today = new Date();
  const lastDayOfThisMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    -1,
  );
  const firstDayOfThisMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1,
  );

  const budgetItems = await getBudgetItemsOfType({
    db: prisma,
    userId,
    type: "expense",
  });

  //Get all of the spending records for the last month
  const savingsTransactions = await prisma.savingsTransaction.findMany({
    where: {
      AND: [
        {
          date: {
            lte: lastDayOfThisMonth,
          },
        },
        {
          date: {
            gte: firstDayOfThisMonth,
          },
        },
      ],
    },
  });

  const outdatedBudgetItems: BudgetItem[] = [];
  //For each transfer budget item, check if there is a transfer transaction. If not, we need to initiate one
  for (const budgetItem of budgetItems) {
    if (
      savingsTransactions.filter(
        (transaction) => transaction.budgetId === budgetItem.id,
      ).length === 0
    ) {
      outdatedBudgetItems.push(budgetItem);
    }
  }

  return outdatedBudgetItems;
};

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  action: {
    type: "transfer";
    items: BudgetItem[];
  };
}
export const getActionItems = async (userId: string): Promise<ActionItem[]> => {
  // const savingsGoals = await checkSavingsTransfer(userId);
  // const budgetItems = await checkExpenseTransfer(userId);

  const budgetItems = await getBudgetItemsOfType({
    db: prisma,
    userId,
    type: "expense",
  });

  const actionItems: ActionItem[] = [
    {
      id: "0",
      title: "Make Transfers",
      description:
        "Some of your categories have not been funded this month. Click to make transfers.",
      action: {
        type: "transfer",
        items: budgetItems,
      },
    },
  ];
  // if (savingsGoals.length > 0 || budgetItems.length > 0) {
  //   actionItems.push({
  //     id: "0",
  //     title: "Make Transfers",
  //     description:
  //       "Some of your categories have not been funded this month. Click to make transfers.",
  //     action: {
  //       type: "transfer",
  //       items: budgetItems,
  //       goals: savingsGoals,
  //     },
  //   });
  // }

  return actionItems;
};

// export const makeVariableExpenseTransaction = async ({
//   db,
//   userId,
//   item,
// }: {
//   db: Db;
//   userId: string;
//   item: BudgetItem;
// }): Promise<void> => {
//   //The amount is what is left until the target averaged among how many months are left in the year
//   const _amount = calculateCadenceMonthlyAmount(item);
//   if (_amount <= 0) {
//     return;
//   }

//   await makeExpenseTransaction({ db, userId, item, amount: _amount });
// };

export const makeExpenseTransaction = async ({
  db,
  from,
  to,
  amount,
}: {
  db: Db;
  from: BudgetItem | undefined;
  to: BudgetItem;
  amount: number;
}): Promise<void> => {
  const transferCategory: TransferCategory = {
    id: "",
    amount,
    date: new Date(),
    from,
    to,
  };
  await createTransferCategory({
    input: transferCategory,
    db,
  });
  from &&
    (await updateBudgetItemAmount({
      db,
      itemId: from.id,
      amount: from.amount - amount,
    }));
  await updateBudgetItemAmount({
    db,
    itemId: to.id,
    amount: to.amount + amount,
  });
};

const makeLoginRequest = async <T>(
  userId: string,
  requestFunc: (req: LoginRequest) => T,
) => {
  const logins = await getLogins({ db: prisma, userId });
  const results = (
    await Promise.all(
      logins.map((login) =>
        requestFunc({ accessToken: login.accessToken, cursor: login.cursor }),
      ),
    )
  ).flat();

  return results;
};
