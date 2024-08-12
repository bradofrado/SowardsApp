import {
  Configuration,
  PlaidApi,
  Products,
  PlaidEnvironments,
  LinkTokenCreateRequest,
  CountryCode,
} from "plaid";

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

export const createLinkToken = async (userId: string): Promise<string> => {
  const configs: LinkTokenCreateRequest = {
    user: {
      // This should correspond to a unique id for the current user.
      client_user_id: userId,
    },
    client_name: "Sowards Budget",
    products: [Products.Transactions],
    country_codes: [CountryCode.Us],
    language: "en",
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

interface PlaidRequest {
  accessToken: string;
}
export const getTransactions = async ({ accessToken }: PlaidRequest) => {
  const response = await plaidClient.transactionsSync({
    access_token: accessToken,
  });

  return response.data.added;
};

export const getAccounts = async ({ accessToken }: PlaidRequest) => {
  const response = await plaidClient.accountsGet({
    access_token: accessToken,
  });

  return response.data.accounts;
};
