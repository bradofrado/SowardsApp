import { vacationGroupSchema } from "model/src/vacation";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../../trpc";
import { getGroups, groupPayload, prismaToVacationGroup } from "../../repositories/group";

export const vacationGroupRouter = createTRPCRouter({
    getGroups: publicProcedure
        .output(z.array(vacationGroupSchema))
        .query(async ({ctx}) => {
            const groups = await getGroups({db: ctx.prisma});

            return groups;
        }),
    createGroup: protectedProcedure
        .input(vacationGroupSchema)
        .output(vacationGroupSchema)
        .mutation(async ({ctx, input}) => {
            const newGroup = await ctx.prisma.vacationGroup.create({
                data: {
                    name: input.name,
                    is_public: input.isPublic,
                    users: !input.isPublic ? {
                        connect: {
                            id: ctx.session.auth.userVacation.id
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
                        connect: {
                            id: ctx.session.auth.userVacation.id
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
                    // users: {
                    //     disconnect: {
                    //         userId: ctx.session.auth.user.id
                    //     }
                    // }
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