import type { Db } from "db/lib/prisma";
import type { ExternalLogin } from "model/src/budget";

export const addExternalLogin = async ({
  db,
  login,
}: {
  db: Db;
  login: ExternalLogin;
}): Promise<ExternalLogin> => {
  const newLogin = await db.externalLogin.create({
    data: login,
  });

  return newLogin;
};

export const updateExternalLoginCursor = async ({
  db,
  accessToken,
  cursor,
}: {
  db: Db;
  accessToken: string;
  cursor: string | null;
}): Promise<void> => {
  await db.externalLogin.update({
    where: {
      accessToken,
    },
    data: {
      cursor,
    },
  });
};

export const deleteExternalLogin = async ({
  db,
  accessToken,
}: {
  db: Db;
  accessToken: string;
}): Promise<void> => {
  await db.externalLogin.delete({
    where: {
      accessToken,
    },
  });
};

export const getLogins = async ({
  db,
  userId,
}: {
  db: Db;
  userId: string;
}): Promise<ExternalLogin[]> => {
  const logins = await db.externalLogin.findMany({
    where: {
      userId,
    },
  });

  return logins;
};
