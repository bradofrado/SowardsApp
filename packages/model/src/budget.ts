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
  description: z.string(),
  transactionCategories: z.array(transactionCategorySchema),
  accountId: z.string().nullable(),
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

// const targetCadence = z.object({
//   type: z.literal("target"),
//   targetAmount: z.number(),
//   currentBalance: z.number(),
// });
// export type TargetCadence = z.infer<typeof targetCadence>;

export const budgetCadenceSchema = z.union([
  weeklyCadence,
  monthlyCadence,
  yearlyCadence,
  eventuallyCadence,
  //targetCadence,
]);
export type BudgetCadence = z.infer<typeof budgetCadenceSchema>;

export const budgetItemSchema = z.object({
  id: z.string(),
  category: categoryBudgetSchema,
  amount: z.number(),
  targetAmount: z.number(),
  periodStart: z.date(),
  periodEnd: z.date(),
  cadence: budgetCadenceSchema,
});
export type BudgetItem = z.infer<typeof budgetItemSchema>;

export const savingsGoalSchema = z.object({
  id: z.string(),
  amount: z.number(),
  targetAmount: z.number(),
  totalSaved: z.number(),
  category: categoryBudgetSchema,
});
export type SavingsGoal = z.infer<typeof savingsGoalSchema>;

export const budgetSchema = z.object({
  id: z.string(),
  name: z.string(),
  items: z.array(budgetItemSchema),
  goals: z.array(savingsGoalSchema),
});
export type Budget = z.infer<typeof budgetSchema>;

export const savingsTransactionSchema = z.object({
  id: z.string(),
  description: z.string(),
  date: z.date(),
  amount: z.number(),
  budgetItem: z.optional(budgetItemSchema),
  savingsGoal: z.optional(savingsGoalSchema),
});
export type SavingsTransaction = z.infer<typeof savingsTransactionSchema>;

export const calculateCadenceMonthlyAmount = (
  item: BudgetItem | SavingsGoal,
): number => {
  if (!("cadence" in item)) {
    return item.amount;
  }

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
