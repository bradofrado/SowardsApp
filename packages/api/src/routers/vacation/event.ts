import { vacationEventSchema } from "model/src/vacation";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../../trpc";
import {
  getVacationEvent,
  getVacationEvents,
  prismaToVacationEvent,
} from "../../repositories/event";
import { getUserVactions } from "../../repositories/user-vacation";
import { getTotalDependents } from "model/src/vacation-utils";
import { generateEvents } from "../../repositories/openai";

export const vacationEventRouter = createTRPCRouter({
  getVacationEvents: publicProcedure
    .output(z.array(vacationEventSchema))
    .query(async ({ ctx }) => {
      return getVacationEvents({ db: ctx.prisma });
    }),
  createVacationEvent: protectedProcedure
    .input(vacationEventSchema)
    .output(vacationEventSchema)
    .mutation(async ({ ctx, input }) => {
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
              id: ctx.session.auth.userVacation.id,
            },
          },
          links: input.links,
          personLimit: input.personLimit,
          // users: {
          // 	connect: {
          // 		id: ctx.session.auth.userVacation.id
          // 	}
          // },
          groups: {
            connect: input.groupIds.map((id) => ({ id })),
          },
        },
      });

      return prismaToVacationEvent(newEvent);
    }),
  updateVacationEvent: protectedProcedure
    .input(vacationEventSchema)
    .output(vacationEventSchema)
    .mutation(async ({ ctx, input }) => {
      const currGroups = await ctx.prisma.vacationGroup.findMany({
        where: {
          userIds: {
            has: ctx.session.auth.userVacation.id,
          },
        },
      });
      const toRemove = currGroups.filter(
        (group) => !input.groupIds.find((id) => id === group.id),
      );
      await ctx.prisma.vacationEvent.update({
        data: {
          groups: {
            disconnect: toRemove.map(({ id }) => ({ id })),
          },
        },
        where: {
          id: input.id,
        },
      });
      const event = await ctx.prisma.vacationEvent.findUnique({
        where: {
          id: input.id,
        },
      });

      if (
        !event ||
        (event.createdById !== ctx.session.auth.userVacation.id &&
          !ctx.session.auth.user.roles.includes("admin"))
      ) {
        throw new Error("You are not the creator of this event");
      }

      const newEvent = await ctx.prisma.vacationEvent.update({
        data: {
          name: input.name,
          date: input.date,
          amounts: input.amounts,
          notes: input.notes,
          durationMinutes: input.durationMinutes,
          is_public: input.isPublic,
          location: input.location,
          links: input.links,
          personLimit: input.personLimit,
          groups: {
            connect: input.groupIds.map((id) => ({ id })),
          },
        },
        where: {
          id: input.id,
        },
      });

      return prismaToVacationEvent(newEvent);
    }),
  joinVacationEvent: protectedProcedure
    .input(z.object({ id: z.string(), userId: z.optional(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const userId =
        !input.userId || !ctx.session.auth.user.roles.includes("admin")
          ? ctx.session.auth.userVacation.id
          : input.userId;

      // Check to see if the event is full
      const users = await getUserVactions();
      const user = users.find((_user) => _user.id === userId);
      if (!user) {
        throw new Error("User not found with id " + userId);
      }
      const event = await getVacationEvent({ db: ctx.prisma, id: input.id });
      if (!event) {
        throw new Error("Event not found with id " + input.id);
      }
      const userEvents = users.filter((_user) =>
        _user.eventIds.includes(input.id),
      );
      const numPeople = getTotalDependents([...userEvents, user]);
      if (event.personLimit && numPeople > event.personLimit) {
        throw new Error("Event is full");
      }

      await ctx.prisma.vacationEvent.update({
        where: {
          id: input.id,
        },
        data: {
          users: {
            connect: {
              id: userId,
            },
          },
        },
      });
    }),
  leaveVacationEvent: protectedProcedure
    .input(z.object({ id: z.string(), userId: z.optional(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const userId =
        !input.userId || !ctx.session.auth.user.roles.includes("admin")
          ? ctx.session.auth.userVacation.id
          : input.userId;
      await ctx.prisma.vacationEvent.update({
        where: {
          id: input.id,
        },
        data: {
          users: {
            disconnect: {
              id: userId,
            },
          },
        },
      });
    }),
  deleteVacationEvent: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.vacationEvent.delete({
        where: {
          id: input,
        },
      });
    }),
  generateEvents: protectedProcedure
    .input(z.date())
    .output(z.array(vacationEventSchema))
    .mutation(async ({ ctx, input }) => {
      if (process.env.NEXT_PUBLIC_GENERATE_EVENTS !== "true") return [];

      const events = await generateEvents(ctx.session.auth.userVacation, input);

      return events;
    }),
});
