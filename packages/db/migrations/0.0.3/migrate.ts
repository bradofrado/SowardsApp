import { UserVacation } from "../../lib/generated/client";
import { MigrationScript } from "../run-migration";

const runMigration: MigrationScript = async (db) => {
  const userVacationCollection = db.collection<UserVacation>("UserVacation");
  const updateResult = await userVacationCollection.updateMany(
    { color: { $exists: false } }, // Condition to add links only if it does not already exist
    { $set: { color: "blue" } }, // Add links field with an empty array
  );

  return `Updated ${updateResult.modifiedCount} documents to add the color field`;
};

export default runMigration;
