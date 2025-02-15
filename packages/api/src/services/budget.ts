/* eslint-disable no-await-in-loop -- ok*/
import type { DbTransaction } from "db/lib/prisma";
import { prisma } from "db/lib/prisma";
import type {
  TransferCategory,
  Budget,
  BudgetItem,
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
import { createTransferCategory } from "../repositories/budget/template/transfer-category";
import {
  budgetPayload,
  getBudgets as getBudgetsRepo,
} from "../repositories/budget/template/budget-template";
import {
  getBudgetItemsOfType,
  updateBudgetItemAmount,
} from "../repositories/budget/template/budget-item";

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
  db: DbTransaction;
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

  const budgetItems = budget.items.map((item, index) => ({
    ...item,
    category: newCategoriesItems[index],
  }));

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
      user: {
        connect: {
          id: userId,
        },
      },
    },
    ...budgetPayload,
  });

  return newBudget;
};

export const getBudgets = async (userId: string): Promise<Budget[]> => {
  const budgets = await getBudgetsRepo({ db: prisma, userId });

  return budgets;
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

  return actionItems;
};

export const makeExpenseTransaction = async ({
  db,
  from,
  to,
  amount,
  date,
}: {
  db: DbTransaction;
  from: BudgetItem | undefined;
  to: BudgetItem;
  amount: number;
  date: Date;
}): Promise<void> => {
  const transferCategory: TransferCategory = {
    id: "",
    amount,
    date,
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
