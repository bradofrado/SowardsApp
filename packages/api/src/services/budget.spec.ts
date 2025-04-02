import { prisma } from "db/lib/prisma";
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import type { UserVacation } from "db/lib/generated/client";
import { createSpendingRecords } from "../repositories/budget/spending";
import { getTransactions } from "./budget";

// Simple mock that returns empty array since we don't use the plaid data in these tests
vi.mock("../repositories/budget/plaid", () => ({
  getTransactionsSync: vi.fn().mockResolvedValue([]),
}));

describe("Budget Service - Transactions", () => {
  let testUser: UserVacation;

  beforeAll(async () => {
    testUser = await prisma.userVacation.create({
      data: {
        name: "Test User",
      },
    });

    // Create test data - 15 records
    const records = Array.from({ length: 15 }, (_, i) => ({
      transactionId: "",
      amount: 100 + i,
      date: new Date(2024, 0, i + 1), // Jan 1-15, 2024
      recordDate: new Date(2024, 0, i + 1),
      description: `Test Transaction ${i}`,
      transactionCategories: [],
      accountId: null,
    }));

    await createSpendingRecords({
      db: prisma,
      userId: testUser.id,
      spendingRecords: records,
    });
  });

  afterAll(async () => {
    await prisma.spendingRecord.deleteMany({
      where: {
        userId: testUser.id,
      },
    });
    await prisma.userVacation.delete({
      where: { id: testUser.id },
    });
  });

  describe("getTransactions", () => {
    it("should return all records when no pagination is provided", async () => {
      const result = await getTransactions(testUser.id);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(15);
    });

    it("should return paginated response when pagination is provided", async () => {
      const result = await getTransactions(testUser.id, { start: 0, count: 5 });

      expect(result).toHaveProperty("total", 15);
      expect(result).toHaveProperty("records");
      expect(Array.isArray(result.records)).toBe(true);
      expect(result.records.length).toBe(5);
    });

    it("should handle partial pages", async () => {
      const result = await getTransactions(testUser.id, {
        start: 10,
        count: 10,
      });

      expect(result.total).toBe(15);
      expect(result.records.length).toBe(5);
    });

    it("should return empty records array for invalid page", async () => {
      const result = await getTransactions(testUser.id, {
        start: 100,
        count: 10,
      });

      expect(result.total).toBe(15);
      expect(result.records.length).toBe(0);
    });
  });
});
