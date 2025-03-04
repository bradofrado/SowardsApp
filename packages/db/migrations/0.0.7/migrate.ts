import { TransactionCategory } from "../../lib/generated/client";
import { MigrationScript } from "../run-migration";

const runMigration: MigrationScript = async (db) => {
  const transactionCategoryCollection = db.collection<TransactionCategory>(
    "TransactionCategory",
  );

  const result = await transactionCategoryCollection.aggregate([
    {
      $lookup: {
        from: "SpendingRecord",
        localField: "transactionId",
        foreignField: "_id",
        as: "transaction",
      },
    },
    {
      $addFields: {
        amount: {
          $cond: {
            if: { $eq: ["$amount", 0] },
            then: { $first: "$transaction.amount" },
            else: "$amount",
          },
        },
      },
    },
    {
      $merge: {
        into: "TransactionCategory",
        whenMatched: "replace",
        whenNotMatched: "discard",
      },
    },
  ]);

  const resultArray = await result.toArray();

  return `Updated ${resultArray.length} documents to add the "amount" field`;
};

export default runMigration;
