import { prisma } from "db/lib/prisma";
import type {
  UserVacation,
  BudgetTemplate,
  BudgetItem,
  BudgetCategory,
} from "db/lib/generated/client";
import {
  describe,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
  it,
  expect,
} from "vitest";
import type { MonthlyCadence } from "model/src/budget";
import {
  updateExpiredBudgets,
  processAutomatedTransfers,
} from "../../services/budget-updates";
import {
  prismaToUserVacation,
  userVacationBudgetPayload,
} from "../../repositories/budget/user-vacation";

describe("Budget Update Cron", () => {
  let testUser: UserVacation;
  let testBudget: BudgetTemplate;
  let testCategory: BudgetCategory;
  let testBudgetItem: BudgetItem;
  const monthlyCadence: MonthlyCadence = {
    type: "monthly",
    dayOfMonth: 1,
  };

  beforeAll(async () => {
    // Create test user
    testUser = await prisma.userVacation.create({
      data: {
        name: "Test User",
      },
    });

    // Create test category
    testCategory = await prisma.budgetCategory.create({
      data: {
        name: "Test Category",
        type: "expense",
        order: 0,
        userId: testUser.id,
      },
    });

    // Create test budget
    testBudget = await prisma.budgetTemplate.create({
      data: {
        name: "Test Budget",
        userId: testUser.id,
      },
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.budgetItem.deleteMany({
      where: { budgetId: testBudget.id },
    });
    await prisma.budgetTemplate.delete({
      where: { id: testBudget.id },
    });
    await prisma.budgetCategory.delete({
      where: { id: testCategory.id },
    });
    await prisma.userVacation.delete({
      where: { id: testUser.id },
    });
  });

  describe("updateExpiredBudgets", () => {
    beforeEach(async () => {
      // Create expired budget item
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

      testBudgetItem = await prisma.budgetItem.create({
        data: {
          amount: 100,
          targetAmount: 1000,
          cadenceAmount: 100,
          periodStart: twoMonthsAgo,
          periodEnd: lastMonth,
          categoryId: testCategory.id,
          budgetId: testBudget.id,
          cadence: monthlyCadence,
        },
      });
    });

    afterEach(async () => {
      await prisma.budgetItem.deleteMany({
        where: { budgetId: testBudget.id },
      });
    });

    it("should create new budget item for expired period", async () => {
      const userWithBudgets = prismaToUserVacation(
        await prisma.userVacation.findFirstOrThrow({
          where: { id: testUser.id },
          ...userVacationBudgetPayload,
        }),
      );

      const createdCount = await updateExpiredBudgets(prisma, userWithBudgets);

      const updatedBudgetItems = await prisma.budgetItem.findMany({
        where: { budgetId: testBudget.id },
      });

      expect(updatedBudgetItems).toHaveLength(2);
      expect(createdCount).toBe(1);
      const newItem = updatedBudgetItems.find(
        (item) => item.id !== testBudgetItem.id,
      );
      expect(newItem).toBeDefined();
      expect(new Date(newItem?.periodStart ?? 0).getTime()).toBeGreaterThan(
        new Date(testBudgetItem.periodEnd).getTime(),
      );
    });

    it("should not create new budget item for non-expired period", async () => {
      // Create a current (non-expired) budget item
      const now = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const currentBudgetItem = await prisma.budgetItem.create({
        data: {
          amount: 100,
          targetAmount: 1000,
          cadenceAmount: 100,
          periodStart: now,
          periodEnd: nextMonth,
          categoryId: testCategory.id,
          budgetId: testBudget.id,
          cadence: monthlyCadence,
        },
      });

      const userWithBudgets = prismaToUserVacation(
        await prisma.userVacation.findFirstOrThrow({
          where: { id: testUser.id },
          ...userVacationBudgetPayload,
        }),
      );

      const createdCount = await updateExpiredBudgets(prisma, userWithBudgets);

      const budgetItems = await prisma.budgetItem.findMany({
        where: { budgetId: testBudget.id },
      });

      // Should only have our two test items (expired and current)
      expect(budgetItems).toHaveLength(2);
      expect(budgetItems.map((item) => item.id)).toContain(
        currentBudgetItem.id,
      );
      expect(budgetItems.map((item) => item.id)).toContain(testBudgetItem.id);
      expect(createdCount).toBe(0);
    });

    it("should set amount equal to targetAmount for new budget items regardless of previous amount", async () => {
      // Update the expired test budget item to have a different amount than targetAmount
      await prisma.budgetItem.update({
        where: { id: testBudgetItem.id },
        data: { amount: 500 }, // Different from targetAmount which is 1000
      });

      const userWithBudgets = prismaToUserVacation(
        await prisma.userVacation.findFirstOrThrow({
          where: { id: testUser.id },
          ...userVacationBudgetPayload,
        }),
      );

      const createdCount = await updateExpiredBudgets(prisma, userWithBudgets);

      const budgetItems = await prisma.budgetItem.findMany({
        where: { budgetId: testBudget.id },
      });

      const newItem = budgetItems.find((item) => item.id !== testBudgetItem.id);

      expect(newItem).toBeDefined();
      expect(newItem?.amount).toBe(testBudgetItem.targetAmount);
      expect(createdCount).toBe(1);
    });
  });

  describe("processAutomatedTransfers", () => {
    beforeEach(async () => {
      // Create budget item needing transfer
      testBudgetItem = await prisma.budgetItem.create({
        data: {
          amount: 100,
          targetAmount: 1000,
          cadenceAmount: 100,
          periodStart: new Date(),
          periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          categoryId: testCategory.id,
          budgetId: testBudget.id,
          cadence: monthlyCadence,
        },
      });
    });

    afterEach(async () => {
      await prisma.transferCategory.deleteMany({
        where: { toId: testBudgetItem.id },
      });
      await prisma.budgetItem.deleteMany({
        where: { budgetId: testBudget.id },
      });
    });

    it("should create transfer for eligible budget item", async () => {
      const userWithBudgets = prismaToUserVacation(
        await prisma.userVacation.findFirstOrThrow({
          where: { id: testUser.id },
          ...userVacationBudgetPayload,
        }),
      );

      const processedCount = await processAutomatedTransfers(
        prisma,
        userWithBudgets,
      );

      const transfers = await prisma.transferCategory.findMany({
        where: { toId: testBudgetItem.id },
      });

      expect(transfers).toHaveLength(1);
      expect(transfers[0].amount).toBe(100);
      expect(transfers[0].fromId).toBeNull();
      expect(processedCount).toBe(1);
      const updatedItem = await prisma.budgetItem.findUnique({
        where: { id: testBudgetItem.id },
      });
      expect(updatedItem?.amount).toBe(200); // Original 100 + transfer 100
    });

    it("should not create transfer if cadenceAmount is 0", async () => {
      await prisma.budgetItem.update({
        where: { id: testBudgetItem.id },
        data: { cadenceAmount: 0 },
      });

      const userWithBudgets = prismaToUserVacation(
        await prisma.userVacation.findFirstOrThrow({
          where: { id: testUser.id },
          ...userVacationBudgetPayload,
        }),
      );

      const processedCount = await processAutomatedTransfers(
        prisma,
        userWithBudgets,
      );

      const transfers = await prisma.transferCategory.findMany({
        where: { toId: testBudgetItem.id },
      });

      expect(transfers).toHaveLength(0);
      expect(processedCount).toBe(0);
    });

    it("should not transfer if item is not in between periodStart and periodEnd", async () => {
      await prisma.budgetItem.update({
        where: { id: testBudgetItem.id },
        data: {
          periodStart: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          periodEnd: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        },
      });

      const userWithBudgets = prismaToUserVacation(
        await prisma.userVacation.findFirstOrThrow({
          where: { id: testUser.id },
          ...userVacationBudgetPayload,
        }),
      );

      const processedCount = await processAutomatedTransfers(
        prisma,
        userWithBudgets,
      );

      const transfers = await prisma.transferCategory.findMany({
        where: { toId: testBudgetItem.id },
      });

      expect(transfers).toHaveLength(0);
      expect(processedCount).toBe(0);
    });

    it("should only transfer amount needed to reach target when less than cadenceAmount", async () => {
      // Update budget item to be close to target amount
      await prisma.budgetItem.update({
        where: { id: testBudgetItem.id },
        data: {
          amount: 950, // Current amount
          targetAmount: 1000, // Target amount
          cadenceAmount: 100, // Monthly transfer amount
        },
      });

      const userWithBudgets = prismaToUserVacation(
        await prisma.userVacation.findFirstOrThrow({
          where: { id: testUser.id },
          ...userVacationBudgetPayload,
        }),
      );

      const processedCount = await processAutomatedTransfers(
        prisma,
        userWithBudgets,
      );

      const transfers = await prisma.transferCategory.findMany({
        where: { toId: testBudgetItem.id },
      });

      expect(transfers).toHaveLength(1);
      expect(transfers[0].amount).toBe(50); // Should only transfer the remaining 50 needed
      expect(transfers[0].fromId).toBeNull();
      expect(processedCount).toBe(1);
      const updatedItem = await prisma.budgetItem.findUnique({
        where: { id: testBudgetItem.id },
      });
      expect(updatedItem?.amount).toBe(1000); // Should be exactly at target amount
    });

    it("should transfer full cadenceAmount when targetAmount is 0", async () => {
      // Update budget item to have 0 target amount and amount greater than cadenceAmount
      await prisma.budgetItem.update({
        where: { id: testBudgetItem.id },
        data: {
          amount: 2000, // Current amount
          targetAmount: 0, // No target amount
          cadenceAmount: 100, // Monthly transfer amount
        },
      });

      const userWithBudgets = prismaToUserVacation(
        await prisma.userVacation.findFirstOrThrow({
          where: { id: testUser.id },
          ...userVacationBudgetPayload,
        }),
      );

      const processedCount = await processAutomatedTransfers(
        prisma,
        userWithBudgets,
      );

      const transfers = await prisma.transferCategory.findMany({
        where: { toId: testBudgetItem.id },
      });

      expect(transfers).toHaveLength(1);
      expect(transfers[0].amount).toBe(100); // Should transfer full cadenceAmount
      expect(transfers[0].fromId).toBeNull();
      expect(processedCount).toBe(1);

      const updatedItem = await prisma.budgetItem.findUnique({
        where: { id: testBudgetItem.id },
      });
      expect(updatedItem?.amount).toBe(2100); // Original 2000 + full transfer 100
    });
  });
});
