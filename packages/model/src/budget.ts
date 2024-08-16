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

export const budgetItemSchema = z.object({
  id: z.string(),
  category: categoryBudgetSchema,
  amount: z.number(),
  startDate: z.date(),
  endDate: z.date(),
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
