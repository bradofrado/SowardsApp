import { BudgetItem } from "../../lib/generated/client";
import { MigrationScript } from "../run-migration";

const runMigration: MigrationScript = async (db) => {
  const budgetCollection = db.collection<BudgetItem>("BudgetItem");

  const monthStart = new Date();
  monthStart.setDate(1);

  const monthEnd = new Date();
  monthEnd.setMonth(monthEnd.getMonth() + 1);
  monthEnd.setDate(0);

  const result = await budgetCollection.updateMany({}, [
    {
      $set: {
        targetAmount: "$amount" as unknown as number,
        periodStart: monthStart,
        periodEnd: monthEnd,
        createdAt: new Date(),
      },
    },
  ]);

  return `Updated ${result.modifiedCount} documents to add the "targetAmount", "periodStart", "periodEnd", and "createdAt" fields`;
};

export default runMigration;
