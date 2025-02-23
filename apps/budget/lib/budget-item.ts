import {
  BudgetItem,
  BudgetCadence,
  CategoryBudget,
  getCadenceStartAndEnd,
  calculateCadenceMonthlyAmount,
} from "model/src/budget";
import { CreateBudgetToolArgs } from "./ai/tools/budget-workflow";
import { z } from "zod";
import { generateUUID } from "./utils";

type BudgetToolItem = CreateBudgetToolArgs["budgetItems"][number];
const convertToolItemToBudgetItem = (
  item: BudgetToolItem,
  categories: CategoryBudget[],
): BudgetItem => {
  const amount = ["monthly", "yearly", "one time"].includes(item.type)
    ? item.amount
    : item.savedAmount ?? 0;
  const targetAmount = item.amount;
  const cadenceMapping: Record<BudgetToolItem["type"], BudgetCadence> = {
    monthly: {
      type: "monthly",
      dayOfMonth: 1,
    },
    yearly: {
      type: "yearly",
      month: 1,
      dayOfMonth: 1,
    },
    "one time": {
      type: "eventually",
    },
    savings: {
      type: "fixed",
      date: z.coerce.date().optional().parse(item.targetDate) ?? new Date(),
    },
  };
  const cadence = cadenceMapping[item.type];
  const { periodStart, periodEnd } = getCadenceStartAndEnd(cadence);

  const category: CategoryBudget = categories.find(
    (c) => c.name === item.category,
  ) ?? {
    id: `cat-${generateUUID()}`,
    name: item.category,
    type: "expense",
    order: 0,
  };

  const budgetItem: BudgetItem = {
    id: generateUUID(),
    amount,
    targetAmount,
    cadenceAmount: 0,
    cadence,
    periodStart,
    periodEnd,
    category,
  };

  budgetItem.cadenceAmount = calculateCadenceMonthlyAmount(budgetItem);
  return budgetItem;
};
export const createBudgetFromBudgetTool = (
  { budgetName, budgetItems }: CreateBudgetToolArgs,
  categoryTotals: { category: CategoryBudget; total: number }[],
  categories: CategoryBudget[],
) => {
  return {
    id: "",
    name: budgetName,
    items: [
      ...budgetItems.map((item) =>
        convertToolItemToBudgetItem(item, categories),
      ),
      ...categoryTotals.map<BudgetItem>(({ category, total }) => ({
        id: generateUUID(),
        amount: total,
        targetAmount: total,
        cadence: {
          type: "monthly",
          dayOfMonth: 1,
        },
        ...getCadenceStartAndEnd({
          type: "monthly",
          dayOfMonth: 1,
        }),
        category,
        cadenceAmount: total,
      })),
    ],
  };
};
