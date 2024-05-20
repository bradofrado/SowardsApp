import type { VacationGroup} from "model/src/vacation";
import { vacationGroupSchema } from "model/src/vacation";
import type { Db, Prisma } from "db/lib/prisma";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../../trpc";

export const vacationGroupRouter = createTRPCRouter({
    createGroup: protectedProcedure
        .input(vacationGroupSchema)
        .output(vacationGroupSchema)
        .mutation(async ({ctx, input}) => {
            const newGroup = await ctx.prisma.vacationGroup.create({
                data: {
                    name: input.name,
                    is_public: input.isPublic,
                    users: !input.isPublic ? {
                        connectOrCreate: {
                            create: {
                                user: {
                                    connect: {
                                        id: ctx.session.auth.user.id
                                    }
                                }
                            },
                            where: {
                                userId: ctx.session.auth.user.id
                            }
                        }
                    } : undefined
                },
                ...groupPayload
            });

            return prismaToVacationGroup(newGroup);
        }),
    updateGroup: protectedProcedure
        .input(vacationGroupSchema)
        .output(vacationGroupSchema)
        .mutation(async ({ctx, input}) => {
            const newGroup = await ctx.prisma.vacationGroup.update({
                data: {
                    name: input.name,
                    is_public: input.isPublic,
                },
                where: {
                    id: input.id
                },
                ...groupPayload
            });

            return prismaToVacationGroup(newGroup);
        }),
    joinGroup: protectedProcedure
        .input(z.string())
        .mutation(async ({ctx, input}) => {
            await ctx.prisma.vacationGroup.update({
                where: {
                    id: input
                },
                data: {
                    users: {
                        connectOrCreate: {
                            create: {
                                user: {
                                    connect: {
                                        id: ctx.session.auth.user.id
                                    }
                                }
                            },
                            where: {
                                userId: ctx.session.auth.user.id
                            }
                        }
                    }
                }
            });
        }),
    leaveGroup: protectedProcedure
        .input(z.string())
        .mutation(async ({ctx, input}) => {
            await ctx.prisma.vacationGroup.update({
                where: {
                    id: input
                },
                data: {
                    users: {
                        disconnect: {
                            userId: ctx.session.auth.user.id
                        }
                    }
                }
            });
        }),
    deleteGroup: protectedProcedure
        .input(z.string())
        .mutation(async ({ctx, input}) => {
            await ctx.prisma.vacationGroup.delete({
                where: {
                    id: input
                }
            });
        })
});

export const getGroups = async ({db}: {db: Db}): Promise<VacationGroup[]> => {
    const groups = await db.vacationGroup.findMany(groupPayload);

    return groups.map(group => prismaToVacationGroup(group));
}

const groupPayload = {
    include: {
        users: {
            include: {
                user: true
            }
        }
    }
} satisfies Prisma.VacationGroupDefaultArgs
const prismaToVacationGroup = (group: Prisma.VacationGroupGetPayload<typeof groupPayload>): VacationGroup => {
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