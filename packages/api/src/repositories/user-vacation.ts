import type { Prisma} from "db/lib/prisma";
import { prisma } from "db/lib/prisma";
import type { UserVacation } from "model/src/vacation";
import { amountTypesSchema } from "model/src/vacation";
import { prismaToVacationEvent } from "./event";
import { groupPayload, prismaToVacationGroup } from "./group";

const payload = {
    include: {
        groups: {
            ...groupPayload
        },
        events: true,
        dependents: true,
        created: true,
        user: true
    }
} satisfies Prisma.UserVacationDefaultArgs
export const getUserVacation = async (userId: string): Promise<UserVacation | undefined> => {
    const vacationAccount = await prisma.userVacation.findUnique({
        where: {
            userId
        },
        ...payload
    });
    if (!vacationAccount) return undefined;

    return prismaToUserVacation(vacationAccount);
}

const prismaToUserVacation = (user: Prisma.UserVacationGetPayload<typeof payload>): UserVacation => {
    return {
        id: user.id,
        userId: user.userId,
        eventIds: user.eventIds,
        groupIds: user.groupIds,
        events: user.events.map(event => prismaToVacationEvent(event)),
        groups: user.groups.map(group => prismaToVacationGroup(group)),
        amountType: amountTypesSchema.parse(user.amountType),
        dependents: user.dependents.map(dependent => ({
            id: dependent.id,
            firstname: dependent.firstname,
            lastname: dependent.lastname,
            amountType: amountTypesSchema.parse(dependent.amountType)
        })),
        createdByEvents: user.created.map(event => prismaToVacationEvent(event)),
        role: user.user.roles[0] || 'user'
    }
} 

export const createUserVacation = async (user: UserVacation): Promise<UserVacation> => {
    const newUser = await prisma.userVacation.create({
        data: {
            userId: user.userId,
            groups: {
                connect: user.groupIds.map(id => ({
                    id
                }))
            },
            events: {
                connect: user.eventIds.map(id => ({
                    id
                }))
            },
            amountType: user.amountType,
            dependents: {
                createMany: {
                    data: user.dependents.map(dependent => ({
                        firstname: dependent.firstname,
                        lastname: dependent.lastname,
                        amountType: dependent.amountType
                    }))
                }
            }
        },
        ...payload
    });

    return prismaToUserVacation(newUser);
}

export const updateUserVacation = async (user: UserVacation): Promise<UserVacation> => {
    const currDependents = await prisma.vacationDependent.findMany({
        where: {
            userId: user.id
        }
    });
    const removeDependents = currDependents.filter(dep => !user.dependents.find(curr => curr.id === dep.id));
    
    await Promise.all(removeDependents.map(remove => prisma.vacationDependent.delete({
        where: {
            id: remove.id
        }
    })))
    await Promise.all(user.dependents.map(dependent => {
        if (dependent.id) {
            return prisma.vacationDependent.update({
                where: {
                    id: dependent.id
                },
                data: {
                    firstname: dependent.firstname,
                    lastname: dependent.lastname,
                    userId: user.id,
                    amountType: dependent.amountType
                }
            })
        }

        return prisma.vacationDependent.create({
            data: {
                firstname: dependent.firstname,
                lastname: dependent.lastname,
                userId: user.id,
                amountType: dependent.amountType
            },
        })
    }))
    
    const newUser = await prisma.userVacation.update({
        where: {
            userId: user.userId,
        },
        data: {
            userId: user.userId,
            groups: {
                connect: user.groupIds.map(id => ({
                    id
                }))
            },
            events: {
                connect: user.eventIds.map(id => ({
                    id
                }))
            },
            amountType: user.amountType,
        },
        ...payload
    });

    return prismaToUserVacation(newUser);
}