import type { Db, Prisma } from "db/lib/prisma";
import type { VacationGroup } from "model/src/vacation";

export const getGroups = async ({db}: {db: Db}): Promise<VacationGroup[]> => {
    const groups = await db.vacationGroup.findMany(groupPayload);

    return groups.map(group => prismaToVacationGroup(group));
}

export const groupPayload = {
    include: {
        users: {
            include: {
                user: true
            }
        }
    }
} satisfies Prisma.VacationGroupDefaultArgs
export const prismaToVacationGroup = (group: Prisma.VacationGroupGetPayload<typeof groupPayload>): VacationGroup => {
    return {
        id: group.id,
        name: group.name,
        isPublic: group.is_public,
        users: group.users.map(({user}) => ({
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            roles: user.roles
        }))
    }
}