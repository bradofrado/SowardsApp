import { Db } from "db/lib/prisma";
import { ExternalLogin } from "model/src/budget";

export const addExternalLogin = async ({
  db,
  login,
}: {
  db: Db;
  login: Omit<ExternalLogin, "id">;
}): Promise<ExternalLogin> => {
  const newLogin = await db.externalLogin.create({
    data: login,
  });

  return newLogin;
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
