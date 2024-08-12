/* eslint-disable no-await-in-loop -- ok*/
import { prisma } from "db/lib/prisma";
import type { AccountBase } from "plaid";
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
import { SpendingRecord } from "model/src/budget";

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
        category: null,
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
  const spendingRecords = await getSpendingRecords({ db: prisma });

  return spendingRecords;
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
