import { prisma } from "db/lib/prisma";
import { beforeAll, afterAll } from "vitest";

beforeAll(async () => {
  // Ensure database connection
  await prisma.$connect();
});

afterAll(async () => {
  // Clean up database connection
  await prisma.$disconnect();
});
