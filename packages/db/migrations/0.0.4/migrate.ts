import { BudgetCategory, UserVacation } from "../../lib/generated/client";
import { MigrationScript } from "../run-migration";

// Add userId to BudgetCategory where name is "Jones 2.0"
const runMigration: MigrationScript = async (db) => {
  const userVacationCollection = db.collection<UserVacation>("UserVacation");
  const jonesUser = await userVacationCollection.findOne({ name: "Jones 2.0" });
  if (!jonesUser) {
    throw new Error("Jones 2.0 user not found");
  }
  const budgetCategoryCollection =
    db.collection<BudgetCategory>("BudgetCategory");
  const result = await budgetCategoryCollection.updateMany(
    {},
    { $set: { userId: jonesUser._id as unknown as string } },
  );

  return `Added userId to ${result.modifiedCount} BudgetCategory documents`;
};

export default runMigration;
