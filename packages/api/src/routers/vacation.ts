import type { Db, Prisma } from "db/lib/prisma";
import {vacationEventSchema, vactionAmountSchema, type VacationEvent} from 'model/src/vacation'
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const vacationRouter = createTRPCRouter({
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
					createdById: ctx.session.auth.user.id
				}
			});

			return prismaToVacationEvent(newEvent);
		}),
	updateVacationEvent: protectedProcedure
		.input(vacationEventSchema)
		.output(vacationEventSchema)
		.mutation(async ({ctx, input}) => {
			const newEvent = await ctx.prisma.vacationEvent.update({
				data: {
					name: input.name,
					date: input.date,
					amounts: input.amounts,
					notes: input.notes,
					durationMinutes: input.durationMinutes,
					is_public: input.isPublic,
					location: input.location,
				},
				where: {
					id: input.id
				}
			});

			return prismaToVacationEvent(newEvent);
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

export async function getVacationEvents({db}: {db: Db}): Promise<VacationEvent[]> {
	const vacationEvents = await db.vacationEvent.findMany();

	return vacationEvents.map(event => prismaToVacationEvent(event));
}

const prismaToVacationEvent = (event: Prisma.VacationEventGetPayload<true>): VacationEvent => {
	return {
		id: event.id,
		name: event.name,
		date: event.date,
		durationMinutes: event.durationMinutes,
		userIds: event.userIds,
		isPublic: event.is_public,
		notes: event.notes,
		location: event.location,
		createdById: event.createdById,
		amounts: z.array(vactionAmountSchema).parse(event.amounts)
	}
}