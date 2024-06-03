import { Prisma, prisma } from "db/lib/prisma";
import type { UserVacation } from "model/src/vacation";
import { amountTypesSchema } from "model/src/vacation";
import { prismaToVacationEvent } from "./event";
import { groupPayload, prismaToVacationGroup } from "./group";

const payload = {
    include: {
        groups: {
            ...groupPayload
        },
        events: true
    }
}
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
        amountType: amountTypesSchema.parse(user.amountType)
    }
} 

export const createUserVacation = async (user: UserVacation): Promise<UserVacation> => {
    const newUser = await prisma.userVacation.create({
        data: {
            userId: user.userId,
            groupIds: user.groupIds,
            eventIds: user.eventIds,
            amountType: user.amountType
        },
        ...payload
    });

    return prismaToUserVacation(newUser);
}