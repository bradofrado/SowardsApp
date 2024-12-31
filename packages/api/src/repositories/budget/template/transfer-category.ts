import type { Db, Prisma } from "db/lib/prisma";
import type { TransferCategory } from "model/src/budget";
import { budgetItemPayload, prismaToBudgetItem } from "./budget-item";

export const transferCategoryPayload = {
  include: {
    from: budgetItemPayload,
    to: budgetItemPayload,
  },
} satisfies Prisma.TransferCategoryDefaultArgs;

export const prismaToTransferCategory = (
  item: Prisma.TransferCategoryGetPayload<typeof transferCategoryPayload>,
): TransferCategory => {
  return {
    id: item.id,
    amount: item.amount,
    from: item.from ? prismaToBudgetItem(item.from) : undefined,
    to: prismaToBudgetItem(item.to),
    date: item.date,
  };
};

export const createTransferCategory = async ({
  db,
  input,
}: {
  db: Db;
  input: TransferCategory;
}): Promise<TransferCategory> => {
  const newTransaction = await db.transferCategory.create({
    data: {
      amount: input.amount,
      date: input.date,
      from: input.from ? { connect: { id: input.from.id } } : undefined,
      to: { connect: { id: input.to.id } },
    },
    ...transferCategoryPayload,
  });

  return prismaToTransferCategory(newTransaction);
};
