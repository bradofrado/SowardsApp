/* eslint-disable no-await-in-loop -- ok*/
import type { Db } from "db/lib/prisma";
import { prisma } from "db/lib/prisma";
import type {
  Budget,
  SavingsGoal,
  SavingsTransaction,
  SpendingRecord,
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
import { createCategory } from "../repositories/budget/category";
import { createSavingsTransaction } from "../repositories/budget/template/savings-transaction";
import {
  getSavingsGoals,
  updateSavingsAmount,
} from "../repositories/budget/template/savings-goal";
import {
  budgetPayload,
  prismaToBudget,
} from "../repositories/budget/template/budget-template";

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

  //Every month we need to make a transfer to any savings accounts
  await checkAndMakeSavingsTransfer(userId);

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
  const newCategoriesGoals = await Promise.all(
    budget.goals.map((item) =>
      item.category.id.includes("cat")
        ? createCategory({
            category: item.category,
            db,
            userId,
          })
        : Promise.resolve(item.category),
    ),
  );

  const budgetItems = budget.items.map((item, index) => ({
    ...item,
    category: newCategoriesItems[index],
  }));
  const savingsGoals = budget.goals.map((item, index) => ({
    ...item,
    category: newCategoriesGoals[index],
  }));

  const newBudget = await db.budgetTemplate.create({
    data: {
      name: budget.name,
      budgetItems: {
        createMany: {
          data: budgetItems.map((item) => ({
            amount: item.amount,
            targetAmount: item.amount,
            periodStart: item.periodStart,
            periodEnd: item.periodEnd,
            categoryId: item.category.id,
            cadence: item.cadence,
          })),
        },
      },
      savingsGoals: {
        createMany: {
          data: savingsGoals.map((item) => ({
            amount: item.amount,
            targetAmount: item.targetAmount,
            //The total saved is 0 because we will make a transfer to the savings account
            totalSaved: 0,
            categoryId: item.category.id,
            description: `${item.category.name} Savings Goal`,
          })),
        },
      },
      user: {
        connect: {
          id: userId,
        },
      },
    },
    ...budgetPayload,
  });

  const modelBudget: Budget = prismaToBudget(newBudget);

  await Promise.all(
    modelBudget.goals.map((item, i) =>
      makeSavingsTransaction({
        db,
        userId,
        item,
        amount: budget.goals[i].totalSaved,
      }),
    ),
  );

  return newBudget;
};

const checkAndMakeSavingsTransfer = async (userId: string): Promise<void> => {
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

  const savingsGoals = await getSavingsGoals({ db: prisma, userId });

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

  //For each transfer budget item, check if there is a transfer transaction. If not, we need to initiate one
  for (const savingsGoal of savingsGoals) {
    if (savingsTransactions.length === 0) {
      await makeSavingsTransaction({ db: prisma, userId, item: savingsGoal });
    }
  }
};

const makeSavingsTransaction = async ({
  db,
  userId,
  item,
  amount,
}: {
  db: Db;
  userId: string;
  item: SavingsGoal;
  amount?: number;
}): Promise<void> => {
  const _amount = amount ?? item.amount;

  const savingsTransaction: SavingsTransaction = {
    id: "",
    amount: _amount,
    date: new Date(),
    description: `Transfer to ${item.category.name}`,
    savingsGoal: item,
  };
  const newTransaction = await createSavingsTransaction({
    input: savingsTransaction,
    db,
    userId,
  });
  await updateSavingsAmount({
    db,
    savingsId: item.id,
    newAmount: item.totalSaved + _amount,
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
