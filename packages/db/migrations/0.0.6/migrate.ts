import { SpendingRecord } from "../../lib/generated/client";
import { MigrationScript } from "../run-migration";

const runMigration: MigrationScript = async (db) => {
  const spendingRecordCollection =
    db.collection<SpendingRecord>("SpendingRecord");

  const result = await spendingRecordCollection.updateMany({}, [
    {
      $set: {
        recordDate: "$date",
      },
    },
  ]);

  return `Updated ${result.modifiedCount} documents to add the "recordDate" field`;
};

export default runMigration;
