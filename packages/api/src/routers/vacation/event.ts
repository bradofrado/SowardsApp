import {vacationEventSchema} from 'model/src/vacation'
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../../trpc";
import { getVacationEvents, prismaToVacationEvent } from "../../repositories/event";

export const vacationEventRouter = createTRPCRouter({
	getVacationEvents: publicProcedure
		.output(z.array(vacationEventSchema))
		.query(async ({ctx}) => {
			return getVacationEvents({db: ctx.prisma});
		}),
	createVacationEvent: protectedProcedure
		.input(vacationEventSchema)
		.output(vacationEventSchema)
		.mutation(async ({ctx, input}) => {
			const newEvent = await ctx.prisma.vacationEvent.create({
				data: {
					name: input.name,
					date: input.date,
					amounts: input.amounts,
					notes: input.notes,
					durationMinutes: input.durationMinutes,
					is_public: input.isPublic,
					location: input.location,
					createdBy: {
						connect: {
							id: ctx.session.auth.userVacation.id
						}
					},
					// users: {
					// 	connect: {
					// 		id: ctx.session.auth.userVacation.id
					// 	}
					// },
					groups: {
						connect: input.groupIds.map(id => ({id}))
					}
				}
			});

			return prismaToVacationEvent(newEvent);
		}),
	updateVacationEvent: protectedProcedure
		.input(vacationEventSchema)
		.output(vacationEventSchema)
		.mutation(async ({ctx, input}) => {
			const currGroups = await ctx.prisma.vacationGroup.findMany({
				where: {
					userIds: {
						has: ctx.session.auth.userVacation.id
					}
				}
			});
			const toRemove = currGroups.filter(group => !input.groupIds.find(id => id === group.id));
			await ctx.prisma.vacationEvent.update({
				data: {
					groups: {
						disconnect: toRemove.map(({id}) => ({id}))
					}
				},
				where: {
					id: input.id
				}
			})
			const newEvent = await ctx.prisma.vacationEvent.update({
				data: {
					name: input.name,
					date: input.date,
					amounts: input.amounts,
					notes: input.notes,
					durationMinutes: input.durationMinutes,
					is_public: input.isPublic,
					location: input.location,
					groups: {
						connect: input.groupIds.map(id => ({id}))
					}
				},
				where: {
					id: input.id
				}
			});

			return prismaToVacationEvent(newEvent);
		}),
	joinVacationEvent: protectedProcedure
        .input(z.string())
        .mutation(async ({ctx, input}) => {
            await ctx.prisma.vacationEvent.update({
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
	leaveVacationEvent: protectedProcedure
        .input(z.string())
        .mutation(async ({ctx, input}) => {
            await ctx.prisma.vacationEvent.update({
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
	deleteVacationEvent: protectedProcedure
		.input(z.string())
		.mutation(async ({ctx, input}) => {
			await ctx.prisma.vacationEvent.delete({
				where: {
					id: input
				}
			});
		})
})



