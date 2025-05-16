import { z } from "zod";

export const categoryBudgetSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.union([
    z.literal("income"),
    z.literal("expense"),
    //z.literal("transfer"),
  ]),
  order: z.number(),
});
export type CategoryBudget = z.infer<typeof categoryBudgetSchema>;

export const transactionCategorySchema = z.object({
  id: z.string(),
  category: categoryBudgetSchema,
  transactionId: z.string(),
  amount: z.number(),
});
export type TransactionCategory = z.infer<typeof transactionCategorySchema>;

export const spendingRecordSchema = z.object({
  transactionId: z.string(),
  amount: z.number(),
  date: z.date(),
  recordDate: z.date(),
  description: z.string(),
  transactionCategories: z.array(transactionCategorySchema),
  accountId: z.string().nullable(),
  isTransfer: z.boolean(),
});
export type SpendingRecord = z.infer<typeof spendingRecordSchema>;

export const externalLoginSchema = z.object({
  accessToken: z.string(),
  cursor: z.string().nullable(),
  itemId: z.string(),
  userId: z.string(),
});
export type ExternalLogin = z.infer<typeof externalLoginSchema>;

const weeklyCadence = z.object({
  type: z.literal("weekly"),
  dayOfWeek: z.union([
    z.literal("sunday"),
    z.literal("monday"),
    z.literal("tuesday"),
    z.literal("wednesday"),
    z.literal("thursday"),
    z.literal("friday"),
    z.literal("saturday"),
  ]),
});
export type WeeklyCadence = z.infer<typeof weeklyCadence>;

const monthlyCadence = z.object({
  type: z.literal("monthly"),
  dayOfMonth: z.number(),
});
export type MonthlyCadence = z.infer<typeof monthlyCadence>;

const yearlyCadence = z.object({
  type: z.literal("yearly"),
  month: z.number(),
  dayOfMonth: z.number(),
});
export type YearlyCadence = z.infer<typeof yearlyCadence>;

const eventuallyCadence = z.object({
  type: z.literal("eventually"),
});
export type EventuallyCadence = z.infer<typeof eventuallyCadence>;

const fixedCadence = z.object({
  type: z.literal("fixed"),
  date: z.coerce.date(),
});
export type FixedCadence = z.infer<typeof fixedCadence>;

export const budgetCadenceSchema = z.union([
  weeklyCadence,
  monthlyCadence,
  yearlyCadence,
  eventuallyCadence,
  fixedCadence,
]);
export type BudgetCadence = z.infer<typeof budgetCadenceSchema>;
export type BudgetCadenceType = BudgetCadence["type"];
export const budgetCadenceTypes: BudgetCadenceType[] =
  budgetCadenceSchema.options.map((o) => o.shape.type.value);

export const budgetItemSchema = z.object({
  id: z.string(),
  category: categoryBudgetSchema,
  amount: z.number(),
  targetAmount: z.number(),
  cadenceAmount: z.number(),
  periodStart: z.date(),
  periodEnd: z.date(),
  cadence: budgetCadenceSchema,
});
export type BudgetItem = z.infer<typeof budgetItemSchema>;

// export const savingsGoalSchema = z.object({
//   id: z.string(),
//   amount: z.number(),
//   targetAmount: z.number(),
//   totalSaved: z.number(),
//   category: categoryBudgetSchema,
// });
// export type SavingsGoal = z.infer<typeof savingsGoalSchema>;

export const budgetSchema = z.object({
  id: z.string(),
  name: z.string(),
  items: z.array(budgetItemSchema),
});
export type Budget = z.infer<typeof budgetSchema>;

export const savingsTransactionSchema = z.object({
  id: z.string(),
  description: z.string(),
  date: z.date(),
  amount: z.number(),
  budgetItem: z.optional(budgetItemSchema),
});
export type SavingsTransaction = z.infer<typeof savingsTransactionSchema>;

export const transferCategorySchema = z.object({
  id: z.string(),
  from: z.optional(budgetItemSchema),
  to: budgetItemSchema,
  amount: z.number(),
  date: z.date(),
});
export type TransferCategory = z.infer<typeof transferCategorySchema>;

export const calculateCadenceMonthlyAmount = (item: BudgetItem): number => {
  if (item.cadence.type === "weekly") {
    const amount = item.amount * 4;
    return amount;
  }

  if (item.cadence.type === "monthly") {
    const amount = item.amount;
    return amount;
  }

  const date = new Date();
  if (item.cadence.type === "yearly") {
    //7 - 3
    const dateDiff =
      date.getMonth() > item.cadence.month
        ? 12 - date.getMonth() + item.cadence.month
        : item.cadence.month - date.getMonth();
    const amount = item.amount / dateDiff;

    return amount;
  }

  const datDiff = 11 - date.getMonth();
  const amount = (item.targetAmount - item.amount) / datDiff;

  return amount;
};

const days = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];
export const getCadenceStartAndEnd = (
  cadenceType: BudgetCadence,
): { periodStart: Date; periodEnd: Date } => {
  switch (cadenceType.type) {
    case "weekly": {
      const date = new Date();
      const dayOfWeek = date.getDay();
      const dayDiff = dayOfWeek - days.indexOf(cadenceType.dayOfWeek);
      const periodStart = new Date(date.getTime() - dayDiff * 86400000);
      const periodEnd = new Date(periodStart.getTime() + 604800000);
      return { periodStart, periodEnd };
    }
    case "monthly": {
      const date = new Date();
      const periodStart = new Date(
        date.getFullYear(),
        date.getMonth(),
        cadenceType.dayOfMonth,
      );
      const periodEnd = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        cadenceType.dayOfMonth,
      );
      return { periodStart, periodEnd };
    }
    case "yearly": {
      const date = new Date();
      const periodStart = new Date(
        date.getFullYear(),
        cadenceType.month,
        cadenceType.dayOfMonth,
      );
      const periodEnd = new Date(
        date.getFullYear() + 1,
        cadenceType.month,
        cadenceType.dayOfMonth,
      );
      return { periodStart, periodEnd };
    }
    case "eventually": {
      return {
        periodStart: new Date(),
        //Infinite time end
        periodEnd: new Date("9999-08-31T23:20:55.675Z"),
      };
    }
    case "fixed": {
      return {
        periodStart: new Date(),
        periodEnd: cadenceType.date,
      };
    }
  }
};
