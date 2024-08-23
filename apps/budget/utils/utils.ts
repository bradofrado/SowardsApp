import { BudgetItem } from "model/src/budget";

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
  const amount = item.amount / datDiff;

  return amount;
};
