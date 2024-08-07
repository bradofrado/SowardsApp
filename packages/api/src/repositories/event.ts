import type { Db, Prisma } from "db/lib/prisma";
import type { VacationEvent } from "model/src/vacation";
import { vactionAmountSchema } from "model/src/vacation";
import { z } from "zod";

export const prismaToVacationEvent = (
  event: Prisma.VacationEventGetPayload<true>,
): VacationEvent => {
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
    amounts: z.array(vactionAmountSchema).parse(event.amounts),
    groupIds: event.groupIds,
    links: event.links,
    personLimit: event.personLimit || undefined,
  };
};

export async function getVacationEvents({
  db,
}: {
  db: Db;
}): Promise<VacationEvent[]> {
  const vacationEvents = await db.vacationEvent.findMany({
    orderBy: {
      date: "asc",
    },
  });

  return vacationEvents.map((event) => prismaToVacationEvent(event));
}

export async function getVacationEvent({
  db,
  id,
}: {
  db: Db;
  id: string;
}): Promise<VacationEvent | undefined> {
  const vacationEvent = await db.vacationEvent.findUnique({
    where: {
      id,
    },
  });

  if (!vacationEvent) return undefined;

  return prismaToVacationEvent(vacationEvent);
}
