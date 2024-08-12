import { prisma } from "db/lib/prisma";
import { getLogins } from "../repositories/budget/external-login";
import { getAccounts } from "../repositories/plaid";
import { getTransactions as getTransactionsRepo } from "../repositories/plaid";

export const getExternalLogins = async (userId: string) => {
  return makeLoginRequest(userId, getAccounts);
};

export const getTransactions = async (userId: string) => {
  return makeLoginRequest(userId, getTransactionsRepo);
};

const makeLoginRequest = async <T>(
  userId: string,
  requestFunc: (req: { accessToken: string }) => T,
) => {
  const logins = await getLogins({ db: prisma, userId });
  const results = (
    await Promise.all(
      logins.map((login) => requestFunc({ accessToken: login.accessToken })),
    )
  ).flat();

  return results;
};
