import { prisma } from "db/lib/prisma";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { UserVacation } from "db/lib/generated/client";
import type { SpendingRecord } from "model/src/budget";
import { createSpendingRecords, getPaginatedSpendingRecords } from "./spending";

describe("Spending Records Pagination", () => {
  let testUser: UserVacation;

  beforeAll(async () => {
    testUser = await prisma.userVacation.create({
      data: {
        name: "Test User",
      },
    });

    // Create test data - 15 records
    const records: SpendingRecord[] = Array.from({ length: 15 }, (_, i) => ({
      transactionId: "",
      amount: 100 + i,
      date: new Date(2024, 0, i + 1), // Jan 1-15, 2024
      recordDate: new Date(2024, 0, i + 1),
      description: `Test Transaction ${i}`,
      transactionCategories: [],
      accountId: null,
      userId: testUser.id,
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

  describe("getPaginatedSpendingRecords", () => {
    it("should return correct page size and total", async () => {
      const result = await getPaginatedSpendingRecords({
        db: prisma,
        userId: testUser.id,
        start: 0,
        count: 5,
      });

      expect(result.total).toBe(15);
      expect(result.records.length).toBe(5);
    });

    it("should maintain date descending order", async () => {
      const result = await getPaginatedSpendingRecords({
        db: prisma,
        userId: testUser.id,
        start: 0,
        count: 10,
      });

      const dates = result.records.map((r) => r.date);
      const sortedDates = [...dates].sort((a, b) => b.getTime() - a.getTime());
      expect(dates).toEqual(sortedDates);
    });

    it("should handle partial last page", async () => {
      const result = await getPaginatedSpendingRecords({
        db: prisma,
        userId: testUser.id,
        start: 10,
        count: 10,
      });

      expect(result.total).toBe(15);
      expect(result.records.length).toBe(5); // Only 5 records remain
    });

    it("should return empty array for invalid page", async () => {
      const result = await getPaginatedSpendingRecords({
        db: prisma,
        userId: testUser.id,
        start: 100,
        count: 10,
      });

      expect(result.total).toBe(15);
      expect(result.records.length).toBe(0);
    });
  });
});
