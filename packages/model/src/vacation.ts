import { z } from "zod"
import { userSchema } from "./auth";

const amountTypes = ['all', 'adult', 'child'] as const;

export const vactionAmountSchema = z.object({
    type: z.union([z.literal('all'), z.literal('adult'), z.literal('child')]),
    amount: z.number()
})
export const vacationEventSchema = z.object({
    id: z.string(),
    name: z.string(),
    location: z.string(),
    notes: z.string(),
    date: z.date(),
    durationMinutes: z.number(),
    amounts: z.array(vactionAmountSchema),
    isPublic: z.boolean(),
    userIds: z.array(z.string()),
    createdById: z.string()
})
export type VacationEvent = z.infer<typeof vacationEventSchema>;

export const vacationGroupSchema = z.object({
    id: z.string(),
    name: z.string(),
    users: z.array(userSchema),
    isPublic: z.boolean()
});
export type VacationGroup = z.infer<typeof vacationGroupSchema>;