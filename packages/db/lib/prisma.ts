import { PrismaClient, Prisma } from "./generated/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export type Db = typeof prisma;
export type DbTransaction = Omit<
  PrismaClient,
  "$on" | "$connect" | "$disconnect" | "$use" | "$transaction" | "$extends"
>;
export { Prisma, PrismaClient } from "./generated/client";
