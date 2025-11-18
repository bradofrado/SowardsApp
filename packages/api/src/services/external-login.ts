import type { Db } from "db/lib/prisma";
import { getAccounts, removeAccount } from "../repositories/budget/plaid";
import { deleteSpendingRecords } from "../repositories/budget/spending";
import { deleteExternalLogin } from "../repositories/budget/external-login";

export const removeExternalLogin = async ({
  accessToken,
  db,
}: {
  accessToken: string;
  db: Db;
}) => {
  const accounts = await getAccounts({
    accessToken,
    cursor: null,
  });
  await Promise.all(
    accounts.map((account) =>
      deleteSpendingRecords({
        db,
        accountId: account.account_id,
      }),
    ),
  );

  await deleteExternalLogin({
    db,
    accessToken,
  });
  await removeAccount({ accessToken });
};
