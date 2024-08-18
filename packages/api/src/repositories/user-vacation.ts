import type { Prisma } from "db/lib/prisma";
import { prisma } from "db/lib/prisma";
import type { UserVacation } from "model/src/vacation";
import { amountTypesSchema } from "model/src/vacation";
import { prismaToVacationEvent } from "./event";
import { groupPayload, prismaToVacationGroup } from "./group";

export const payload = {
  include: {
    groups: {
      ...groupPayload,
    },
    events: true,
    dependents: true,
    created: true,
  },
} satisfies Prisma.UserVacationDefaultArgs;
export const getUserVacation = async (
  id: string,
): Promise<UserVacation | undefined> => {
  const vacationAccount = await prisma.userVacation.findUnique({
    where: {
      id,
    },
    ...payload,
  });
  if (!vacationAccount) return undefined;

  return prismaToUserVacation(vacationAccount);
};

export const getUserVactions = async (): Promise<UserVacation[]> => {
  const users = await prisma.userVacation.findMany(payload);

  return users.map((user) => prismaToUserVacation(user));
};

export const prismaToUserVacation = (
  user: Prisma.UserVacationGetPayload<typeof payload>,
): UserVacation => {
  return {
    id: user.id,
    name: user.name,
    eventIds: user.eventIds,
    groupIds: user.groupIds,
    events: user.events.map((event) => prismaToVacationEvent(event)),
    groups: user.groups.map((group) => prismaToVacationGroup(group)),
    dependents: user.dependents.map((dependent) => ({
      id: dependent.id,
      firstname: dependent.firstname,
      lastname: dependent.lastname,
      amountType: amountTypesSchema.parse(dependent.amountType),
    })),
    createdByEvents: user.created.map((event) => prismaToVacationEvent(event)),
  };
};

export const createUserVacation = async (
  user: UserVacation,
  userId: string,
): Promise<UserVacation> => {
  const newUser = await prisma.userVacation.create({
    data: {
      groups:
        user.groupIds.length > 0
          ? {
              connect: user.groupIds.map((id) => ({
                id,
              })),
            }
          : undefined,
      events:
        user.eventIds.length > 0
          ? {
              connect: user.eventIds.map((id) => ({
                id,
              })),
            }
          : undefined,
      dependents:
        user.dependents.length > 0
          ? {
              createMany: {
                data: user.dependents.map((dependent) => ({
                  firstname: dependent.firstname,
                  lastname: dependent.lastname,
                  amountType: dependent.amountType,
                })),
              },
            }
          : undefined,
      name: user.name,
      users: {
        connect: {
          id: userId,
        },
      },
    },
    ...payload,
  });

  return prismaToUserVacation(newUser);
};

export const updateUserVacation = async (
  user: UserVacation,
): Promise<UserVacation> => {
  const currDependents = await prisma.vacationDependent.findMany({
    where: {
      userId: user.id,
    },
  });
  const removeDependents = currDependents.filter(
    (dep) => !user.dependents.find((curr) => curr.id === dep.id),
  );

  await Promise.all(
    removeDependents.map((remove) =>
      prisma.vacationDependent.delete({
        where: {
          id: remove.id,
        },
      }),
    ),
  );
  await Promise.all(
    user.dependents.map((dependent) => {
      if (dependent.id) {
        return prisma.vacationDependent.update({
          where: {
            id: dependent.id,
          },
          data: {
            firstname: dependent.firstname,
            lastname: dependent.lastname,
            userId: user.id,
            amountType: dependent.amountType,
          },
        });
      }

      return prisma.vacationDependent.create({
        data: {
          firstname: dependent.firstname,
          lastname: dependent.lastname,
          userId: user.id,
          amountType: dependent.amountType,
        },
      });
    }),
  );

  const newUser = await prisma.userVacation.update({
    where: {
      id: user.id,
    },
    data: {
      groups: {
        connect: user.groupIds.map((id) => ({
          id,
        })),
      },
      events: {
        connect: user.eventIds.map((id) => ({
          id,
        })),
      },
      name: user.name,
    },
    ...payload,
  });

  return prismaToUserVacation(newUser);
};
