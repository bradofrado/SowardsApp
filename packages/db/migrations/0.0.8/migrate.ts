import {
  SpendingRecord,
  TransactionCategory,
} from "../../lib/generated/client";
import { MigrationScript } from "../run-migration";

const runMigration: MigrationScript = async (db) => {
  const spendingRecordCollection =
    db.collection<SpendingRecord>("SpendingRecord");

  const result = await spendingRecordCollection.updateMany(
    {},
    {
      $set: {
        isTransfer: false,
      },
    },
  );
  const resultArray = result.modifiedCount;

  return `Updated ${resultArray} documents to add the "amount" field`;
};

export default runMigration;
