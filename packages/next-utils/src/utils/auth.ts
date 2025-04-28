import { getServerAuthSession } from "api/src/auth";
import { auth } from "@clerk/nextjs/server";
import type { Session } from "model/src/auth";
import { cookies } from "next/headers";

export const getAuthSession = async (): Promise<Session | undefined> => {
  const session = await getServerAuthSession(
    cookies().get("harmony-user-id")?.value ?? auth().userId,
  );

  return session;
};
