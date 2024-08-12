import { Db, Prisma } from "db/lib/prisma";
import { SpendingRecord } from "model/src/budget";
import { prismaToBudgetCategory } from "./category";

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
      amount: spendingRecord.amount,
      date: spendingRecord.date,
      description: spendingRecord.description,
      categoryId: spendingRecord.category.id,
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
  await db.spendingRecord.updateMany({
    data: spendingRecords.map((spendingRecord) => ({
      userId,
      amount: spendingRecord.amount,
      date: spendingRecord.date,
      description: spendingRecord.description,
      categoryId: spendingRecord.category.id,
    })),
  });
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
      id: spendingRecord.id,
    },
    data: {
      userId,
      amount: spendingRecord.amount,
      date: spendingRecord.date,
      description: spendingRecord.description,
      categoryId: spendingRecord.category.id,
    },
    ...spendingRecordPayload,
  });
  return prismaToSpendingRecord(record);
};

export const prismaToSpendingRecord = (
  spendingRecord: Prisma.SpendingRecordGetPayload<typeof spendingRecordPayload>,
): SpendingRecord => {
  return {
    id: spendingRecord.id,
    amount: spendingRecord.amount,
    date: spendingRecord.date,
    description: spendingRecord.description,
    category: prismaToBudgetCategory(spendingRecord.category),
  };
};
