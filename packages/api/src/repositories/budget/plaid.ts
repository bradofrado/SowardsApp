/* eslint-disable no-await-in-loop -- ok*/
import type {
  LinkTokenCreateRequest,
  Transaction,
  AccountBase,
  RemovedTransaction,
} from "plaid";
import {
  Configuration,
  PlaidApi,
  Products,
  PlaidEnvironments,
  CountryCode,
} from "plaid";
import type { LoginRequest } from "./types";

const PLAID_ENV = process.env.PLAID_ENV || "sandbox";
const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;

const configuration = new Configuration({
  basePath: PlaidEnvironments[PLAID_ENV],
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": PLAID_CLIENT_ID,
      "PLAID-SECRET": PLAID_SECRET,
      "Plaid-Version": "2020-09-14",
    },
  },
});

const plaidClient = new PlaidApi(configuration);

const handleUpdateItemError = <
  Params extends { accessToken: string },
  ReturnType,
>(
  func: (params: Params) => Promise<ReturnType>,
): ((params: Params) => Promise<ReturnType>) => {
  return async (params: Params) => {
    try {
      const data = await func(params);
      return data;
    } catch (err) {
      throw new Error(params.accessToken);
    }
  };
};

//Access token is passed when doing update mode for a specific item
export const createLinkToken = async (
  userId: string,
  accessToken?: string,
): Promise<string> => {
  const configs: LinkTokenCreateRequest = {
    user: {
      // This should correspond to a unique id for the current user.
      client_user_id: userId,
    },
    client_name: "Sowards Budget",
    products: accessToken ? [] : [Products.Transactions],
    country_codes: [CountryCode.Us],
    language: "en",
    access_token: accessToken,
  };

  const createTokenResponse = await plaidClient.linkTokenCreate(configs);

  return createTokenResponse.data.link_token;
};

export const setAccessToken = async (
  publicToken: string,
): Promise<{ accessToken: string; itemId: string }> => {
  const response = await plaidClient.itemPublicTokenExchange({
    public_token: publicToken,
  });

  return {
    accessToken: response.data.access_token,
    itemId: response.data.item_id,
  };
};

export const removeAccount = handleUpdateItemError(
  async ({ accessToken }: { accessToken: string }): Promise<void> => {
    await plaidClient.itemRemove({
      access_token: accessToken,
    });
  },
);

export const compareTxnsByDateAscending = (
  a: Transaction,
  b: Transaction,
): number => (a.date > b.date ? 1 : 0) - (a.date < b.date ? 1 : 0);

export const getTransactionsSync = handleUpdateItemError(
  async ({
    accessToken,
    cursor,
  }: LoginRequest): Promise<{
    added: Transaction[];
    removed: RemovedTransaction[];
    modified: Transaction[];
    cursor: string | null;
    accessToken: string;
  }> => {
    const added: Transaction[] = [];
    const removed: RemovedTransaction[] = [];
    const modified: Transaction[] = [];
    let hasMore = true;
    let currCursor = cursor;
    while (hasMore) {
      const response = await plaidClient.transactionsSync({
        access_token: accessToken,
        cursor: currCursor ?? undefined,
      });
      added.push(...response.data.added);
      removed.push(...response.data.removed);
      modified.push(...response.data.modified);
      hasMore = response.data.has_more;
      currCursor = response.data.next_cursor;
    }

    return {
      added: added.sort(compareTxnsByDateAscending),
      removed,
      modified: modified.sort(compareTxnsByDateAscending),
      cursor: currCursor,
      accessToken,
    };
  },
);

export const getAccounts = handleUpdateItemError(
  async ({
    accessToken,
  }: LoginRequest): Promise<(AccountBase & { access_token: string })[]> => {
    const response = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    return response.data.accounts.map((account) => ({
      ...account,
      access_token: accessToken,
    }));
  },
);
