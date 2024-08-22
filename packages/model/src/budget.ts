import { z } from "zod";

export const categoryBudgetSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.union([z.literal("income"), z.literal("expense")]),
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

const budgetCadence = z.union([
  weeklyCadence,
  monthlyCadence,
  yearlyCadence,
  eventuallyCadence,
]);
export type BudgetCadence = z.infer<typeof budgetCadence>;

export const budgetItemSchema = z.object({
  id: z.string(),
  category: categoryBudgetSchema,
  amount: z.number(),
  cadence: budgetCadence,
});
export type BudgetItem = z.infer<typeof budgetItemSchema>;

export const budgetSchema = z.object({
  id: z.string(),
  name: z.string(),
  items: z.array(budgetItemSchema),
});
export type Budget = z.infer<typeof budgetSchema>;

export const savingsAccountSchema = z.object({
  id: z.string(),
  name: z.string(),
  balance: z.number(),
  type: z.union([z.literal("other"), z.literal("savings")]),
});

/**
 * weekly - day of week
 * monthly - day of month
 * yearly - month and day
 * eventually (throughout the year)
 *
 *
 * First pull from checkings
 * Then pull from savings
 *
 * $10,000
 * Weekly $100 Food - 4 weeks to go, so $400
 *
 * $9,600
 * Monthly $1000 Rent
 *
 * $8,600
 * Yearly $425 ROC pass - 8 months to go, so $53.13
 *
 * $8,546.87
 * Eventually $1000 Vacation - until end of the year?
 *
 * 8,046.87
 * Monthly tithing - %10 of income
 *
 * Goal - $100,000 for house
 * Current amount - $0
 * Target date - 2025
 * Amount each month - $1,666.67
 */
