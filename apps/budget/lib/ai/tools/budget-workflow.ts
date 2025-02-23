import { tool } from "ai";
import { createAccountFromName } from "api/src/services/account";
import { getAuthSession } from "next-utils/src/utils/auth";
import { z } from "zod";
import { hitlTool } from "./utils";
import { ExternalAccount } from "@/utils/components/totals/types";
import { createBudget, getExternalLogins } from "api/src/services/budget";
import { Budget, budgetSchema, categoryBudgetSchema } from "model/src/budget";
import { prisma } from "db/lib/prisma";
import { createBudgetFromBudgetTool } from "../../budget-item";
import { redirect } from "next/navigation";

export const createAccount = tool({
  description: "Create a new account with the given account name",
  parameters: z.object({
    accountName: z.string().describe("The name of the account to create"),
  }),
  execute: async ({ accountName }) => {
    const session = await getAuthSession();
    if (!session) {
      throw new Error("No session found");
    }
    const account = await createAccountFromName(accountName, session);

    return account;
  },
});

export const getBankAccounts = tool({
  description: "Get the user's bank accounts",
  parameters: z.object({}),
  execute: async () => {
    const session = await getAuthSession();
    if (!session) {
      throw new Error("No session found");
    }

    if (!session.auth.userVacation) {
      throw new Error("No user vacation found");
    }

    const accounts = await getExternalLogins(session.auth.userVacation.id);

    return accounts.map((account) => ({
      name: account.name,
      account_id: account.account_id,
      subtype: account.subtype ?? "",
      mask: account.mask ?? "",
      access_token: account.access_token,
    })) satisfies ExternalAccount[];
  },
});

export const connectBankAccount = hitlTool({
  description: "Connect a bank account to the user's account",
  parameters: z.object({}),
});

export const calculateFinanceTotals = hitlTool({
  description: "Show the user a snapshot of their finances",
  parameters: z.object({}),
});

export const createBudgetToolSchema = z.object({
  budgetName: z.string().describe("The name of the budget"),
  budgetItems: z
    .array(
      z.object({
        category: z.string().describe("The category of the budget item"),
        amount: z
          .number()
          .describe(
            "The amount of money the user wants to allocate to the category. For savings type, this is the target amount that the user wants to save.",
          ),
        savedAmount: z
          .number()
          .optional()
          .describe(
            "The amount of money the user has saved in this category for savings type",
          ),
        targetDate: z.coerce
          .date()
          .optional()
          .describe(
            "The target date to reach the target amount. Only used for savings type",
          ),
        type: z
          .union([
            z.literal("monthly").describe("Budget items that repeat monthly"),
            z.literal("yearly").describe("Bugdet items that repeat yearly"),
            z
              .literal("one time")
              .describe("Goals that are one time expenses without a date"),
            z
              .literal("savings")
              .describe(
                "Savings goals that are one time but have a fixed end date",
              ),
          ])
          .describe(
            "The type of budget item. Must be one of the following: monthly, yearly, one time, savings",
          ),
      }),
    )
    .describe("The items in the budget"),
});
export type CreateBudgetToolArgs = z.infer<typeof createBudgetToolSchema>;

export const createBudgetTool = hitlTool({
  description: "Create a new budget for the user",
  parameters: createBudgetToolSchema,
  resultParameters: z.object({
    budget: budgetSchema,
  }),
  execute: async ({ budget }) => {
    const session = await getAuthSession();
    if (!session?.auth.userVacation?.id) {
      throw new Error("No session found");
    }

    await createBudget({
      budget,
      db: prisma,
      userId: session.auth.userVacation.id,
    });

    return false;
  },
});
