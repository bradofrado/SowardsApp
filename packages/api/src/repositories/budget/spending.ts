import type { Db, Prisma } from "db/lib/prisma";
import type { SpendingRecord } from "model/src/budget";
import { prismaToBudgetCategory } from "./category";
import { v4 as uuidv4 } from "uuid";

const spendingRecordPayload = {
  include: {
    transactionCategories: {
      include: {
        category: true,
      },
    },
  },
} satisfies Prisma.SpendingRecordDefaultArgs;

export const getSpendingRecords = async ({
  db,
}: {
  db: Db;
}): Promise<SpendingRecord[]> => {
  const records = await db.spendingRecord.findMany({
    orderBy: {
      date: "desc",
    },
    ...spendingRecordPayload,
  });

  return records.map(prismaToSpendingRecord);
};

export const getSpendingRecord = async ({
  db,
  transactionId,
}: {
  db: Db;
  transactionId: string;
}): Promise<SpendingRecord | null> => {
  const record = await db.spendingRecord.findFirst({
    where: {
      transactionId,
    },
    ...spendingRecordPayload,
  });

  return record ? prismaToSpendingRecord(record) : null;
};

export const createSpendingRecord = async ({
  spendingRecord,
  db,
  userId,
}: {
  spendingRecord: SpendingRecord;
  db: Db;
  userId: string;
}): Promise<SpendingRecord> => {
  const transactionId = spendingRecord.transactionId || uuidv4();
  const newRecord = await db.spendingRecord.create({
    data: {
      user: {
        connect: {
          id: userId,
        },
      },
      transactionId,
      amount: spendingRecord.amount,
      date: spendingRecord.date,
      description: spendingRecord.description,
      transactionCategories:
        spendingRecord.transactionCategories.length > 0
          ? {
              createMany: {
                data: spendingRecord.transactionCategories.map(
                  (transactionCategory) => ({
                    amount: transactionCategory.amount,
                    categoryId: transactionCategory.category.id,
                    transactionId,
                  }),
                ),
              },
            }
          : undefined,
      accountId: spendingRecord.accountId,
    },
    ...spendingRecordPayload,
  });

  return prismaToSpendingRecord(newRecord);
};

export const createSpendingRecords = async ({
  spendingRecords,
  db,
  userId,
}: {
  spendingRecords: SpendingRecord[];
  db: Db;
  userId: string;
}): Promise<void> => {
  await Promise.all(
    spendingRecords.map((spendingRecord) => {
      const transactionId = spendingRecord.transactionId || uuidv4();
      return db.spendingRecord.create({
        data: {
          user: {
            connect: {
              id: userId,
            },
          },
          transactionId,
          amount: spendingRecord.amount,
          date: spendingRecord.date,
          description: spendingRecord.description,
          transactionCategories:
            spendingRecord.transactionCategories.length > 0
              ? {
                  createMany: {
                    data: spendingRecord.transactionCategories.map(
                      (transactionCategory) => ({
                        amount: transactionCategory.amount,
                        categoryId: transactionCategory.category.id,
                        transactionId,
                      }),
                    ),
                  },
                }
              : undefined,
          accountId: spendingRecord.accountId,
        },
      });
    }),
  );
};

export const updateSpendingRecord = async ({
  spendingRecord,
  db,
  userId,
}: {
  spendingRecord: SpendingRecord;
  db: Db;
  userId: string;
}): Promise<SpendingRecord> => {
  const currentTransactionCategories = await db.transactionCategory.findMany({
    where: {
      transactionId: spendingRecord.transactionId,
    },
  });

  //Create or update transaction categories
  await Promise.all(
    spendingRecord.transactionCategories.map((transactionCategory) => {
      if (transactionCategory.id) {
        return db.transactionCategory.update({
          where: {
            id: transactionCategory.id,
          },
          data: {
            amount: transactionCategory.amount,
            categoryId: transactionCategory.category.id,
          },
        });
      }
      return db.transactionCategory.create({
        data: {
          amount: transactionCategory.amount,
          categoryId: transactionCategory.category.id,
          transactionId: spendingRecord.transactionId,
        },
      });
    }),
  );

  //Delete transaction categories that are not in the new list
  await Promise.all(
    currentTransactionCategories.map((currentTransactionCategory) => {
      if (
        !spendingRecord.transactionCategories.find(
          (transactionCategory) =>
            transactionCategory.id === currentTransactionCategory.id,
        )
      ) {
        return db.transactionCategory.delete({
          where: {
            id: currentTransactionCategory.id,
          },
        });
      }

      return undefined;
    }),
  );
  const record = await db.spendingRecord.update({
    where: {
      transactionId: spendingRecord.transactionId,
    },
    data: {
      user: {
        connect: {
          id: userId,
        },
      },
      amount: spendingRecord.amount,
      date: spendingRecord.date,
      description: spendingRecord.description,
      accountId: spendingRecord.accountId,
    },
    ...spendingRecordPayload,
  });
  return prismaToSpendingRecord(record);
};

export const deleteSpendingRecord = async ({
  transactionId,
  db,
}: {
  transactionId: string;
  db: Db;
}): Promise<void> => {
  await db.spendingRecord.delete({
    where: {
      transactionId,
    },
  });
};

export const prismaToSpendingRecord = (
  spendingRecord: Prisma.SpendingRecordGetPayload<typeof spendingRecordPayload>,
): SpendingRecord => {
  return {
    transactionId: spendingRecord.transactionId,
    amount: spendingRecord.amount,
    date: spendingRecord.date,
    description: spendingRecord.description,
    transactionCategories: spendingRecord.transactionCategories.map(
      (transactionCategory) => ({
        id: transactionCategory.id,
        amount: transactionCategory.amount,
        category: prismaToBudgetCategory(transactionCategory.category),
        transactionId: transactionCategory.transactionId,
      }),
    ),
    accountId: spendingRecord.accountId,
  };
};
