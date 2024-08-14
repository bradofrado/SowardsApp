import { MigrationScript } from "../run-migration";
import { TransactionCategory } from "../../lib/generated/client";

const runMigration: MigrationScript = async (db) => {
  const transactionCollection = db.collection<{
    categoryId?: null;
    amount: number;
  }>("SpendingRecord");
  const transactionCategoryCollection = db.collection<
    Omit<TransactionCategory, "id">
  >("TransactionCategory");
  const spendingRecords = await transactionCollection.find().toArray();

  let numUpdates = 0;
  for (const spendingRecord of spendingRecords) {
    if (spendingRecord.categoryId) {
      await transactionCategoryCollection.insertOne({
        amount: spendingRecord.amount,
        transactionId: spendingRecord._id as unknown as string,
        categoryId: spendingRecord.categoryId,
      });
      numUpdates++;
    }
  }

  return `Updated ${numUpdates} transactions to add the transaction category collection`;
};

export default runMigration;
