/* eslint-disable no-await-in-loop -- ok*/
import type { Db } from "db/lib/prisma";
import { prisma } from "db/lib/prisma";
import type { Budget, BudgetItem, SpendingRecord } from "model/src/budget";
import type { AccountBase, AccountType } from "plaid";
import { v4 as uuidv4 } from "uuid";
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
  createSpendingRecord,
} from "../repositories/budget/spending";
import { createCategory } from "../repositories/budget/category";
import { getBudgetItemsOfType } from "../repositories/budget/template/budget-item";

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
  accountType: AccountType | "Savings";
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

    const type =
      transaction.transactionCategories[0]?.category.type === "transfer"
        ? "Savings"
        : account?.type;
    if (!type) {
      throw new Error(
        `Cannot find account type with id ${transaction.accountId}`,
      );
    }

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
  const newCategories = await Promise.all(
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

  const budgetItems = budget.items.map((item, index) => ({
    ...item,
    category: newCategories[index],
  }));

  await Promise.all(
    budgetItems
      .filter((item) => item.category.type === "transfer")
      .map((item) =>
        makeSavingsTransaction({ db, userId, item, useCurrentBalance: true }),
      ),
  );

  return db.budgetTemplate.create({
    data: {
      name: budget.name,
      budgetItems: {
        createMany: {
          data: budgetItems.map((item) => ({
            amount: item.amount,
            categoryId: item.category.id,
            cadence: item.cadence,
          })),
        },
      },
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
};

const checkAndMakeSavingsTransfer = async (userId: string): Promise<void> => {
  //Check if we need to make a savings transfer
  const today = new Date();
  const lastDayOfLastMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    -1,
  );
  const firstDayOfLastMonth = new Date(
    today.getFullYear(),
    today.getMonth() - 1,
    1,
  );

  const transferBudgetItems = await getBudgetItemsOfType({
    db: prisma,
    userId,
    type: "transfer",
  });

  //Get all of the spending records for the last month
  const spendingRecords = await prisma.spendingRecord.findMany({
    where: {
      AND: [
        {
          date: {
            lte: lastDayOfLastMonth,
          },
        },
        {
          date: {
            gte: firstDayOfLastMonth,
          },
        },
      ],
    },
    include: {
      transactionCategories: {
        include: {
          category: true,
        },
      },
    },
  });

  //For each transfer budget item, check if there is a transfer transaction. If not, we need to initiate one
  for (const budgetItem of transferBudgetItems) {
    const savingsTransactions = spendingRecords.filter(
      (record) =>
        record.transactionCategories.length > 0 &&
        record.transactionCategories[0].category.id === budgetItem.category.id,
    );

    if (savingsTransactions.length === 0) {
      await makeSavingsTransaction({ db: prisma, userId, item: budgetItem });
    }
  }
};

const makeSavingsTransaction = async ({
  db,
  userId,
  item,
  useCurrentBalance = false,
}: {
  db: Db;
  userId: string;
  item: BudgetItem;
  useCurrentBalance?: boolean;
}) => {
  if (item.cadence.type !== "target") {
    throw new Error("Invalid cadence type for savings transaction");
  }

  const transactionId = uuidv4();
  const amount = useCurrentBalance ? item.cadence.currentBalance : item.amount;
  const today = new Date();
  const lastDayOfLastMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    -1,
  );

  const savingRecord: SpendingRecord = {
    accountId: null,
    amount,
    date: lastDayOfLastMonth,
    description: "Saving Transfer",
    transactionId,
    transactionCategories: [
      {
        id: "",
        amount,
        category: item.category,
        transactionId,
      },
    ],
  };
  await createSpendingRecord({ spendingRecord: savingRecord, db, userId });
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
