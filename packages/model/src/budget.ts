import { z } from "zod";

export const categoryBudgetSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.union([z.literal("income"), z.literal("expense")]),
});
export type CategoryBudget = z.infer<typeof categoryBudgetSchema>;

export const spendingRecordSchema = z.object({
  id: z.string(),
  amount: z.number(),
  date: z.date(),
  description: z.string(),
  category: categoryBudgetSchema,
});
export type SpendingRecord = z.infer<typeof spendingRecordSchema>;

export const externalLoginSchema = z.object({
  id: z.string(),
  accessToken: z.string(),
  itemId: z.string(),
  userId: z.string(),
});
export type ExternalLogin = z.infer<typeof externalLoginSchema>;
