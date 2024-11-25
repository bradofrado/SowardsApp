import { VacationEvent } from "../../lib/generated/client";
import { MigrationScript } from "../run-migration";

const runMigration: MigrationScript = async (db) => {
  const collection = db.collection<VacationEvent>("VacationEvent");
  const updateResult = await collection.updateMany(
    { links: { $exists: false } }, // Condition to add links only if it does not already exist
    { $set: { links: [] } }, // Add links field with an empty array
  );

  return `Updated ${updateResult.modifiedCount} documents to add the "links" field`;
};

export default runMigration;
