import type { Db, Prisma } from "db/lib/prisma";
import type { SpendingRecord } from "model/src/budget";
import { prismaToBudgetCategory } from "./category";
import { v4 as uuidv4 } from "uuid";

const spendingRecordPayload = {
  include: {
    category: true,
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
  const newRecord = await db.spendingRecord.create({
    data: {
      userId,
      transactionId: spendingRecord.transactionId || uuidv4(),
      amount: spendingRecord.amount,
      date: spendingRecord.date,
      description: spendingRecord.description,
      categoryId: spendingRecord.category ? spendingRecord.category.id : null,
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
    spendingRecords.map((spendingRecord) =>
      db.spendingRecord.create({
        data: {
          userId,
          amount: spendingRecord.amount,
          date: spendingRecord.date,
          description: spendingRecord.description,
          categoryId: spendingRecord.category
            ? spendingRecord.category.id
            : null,
          transactionId: spendingRecord.transactionId,
          accountId: spendingRecord.accountId,
        },
      }),
    ),
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
  const record = await db.spendingRecord.update({
    where: {
      transactionId: spendingRecord.transactionId,
    },
    data: {
      userId,
      amount: spendingRecord.amount,
      date: spendingRecord.date,
      description: spendingRecord.description,
      categoryId: spendingRecord.category ? spendingRecord.category.id : null,
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
    category: spendingRecord.category
      ? prismaToBudgetCategory(spendingRecord.category)
      : null,
    accountId: spendingRecord.accountId,
  };
};
