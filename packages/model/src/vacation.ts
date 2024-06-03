import { z } from "zod"
import { userSchema } from "./auth";

const amountTypes = ['all', 'adult', 'child'] as const;

export const amountTypesSchema = z.union([z.literal('all'), z.literal('adult'), z.literal('child')]);
export type AmountType = z.infer<typeof amountTypesSchema>;

export const vactionAmountSchema = z.object({
    type: amountTypesSchema,
    amount: z.number()
})
export const dependentSchema = z.object({
    id: z.string(),
    firstname: z.string(),
    lastname: z.string(),
    amountType: amountTypesSchema
});
export type VacationDependent = z.infer<typeof dependentSchema>;

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
    groupIds: z.array(z.string()),
    createdById: z.string()
})
export type VacationEvent = z.infer<typeof vacationEventSchema>;

export const vacationGroupSchema = z.object({
    id: z.string(),
    name: z.string(),
    users: z.array(z.intersection(dependentSchema, z.object({dependents: z.array(dependentSchema)}))),
    isPublic: z.boolean()
});
export type VacationGroup = z.infer<typeof vacationGroupSchema>;

export const userVacationSchema = z.object({
    id: z.string(),
    userId: z.string(),
    groupIds: z.array(z.string()),
    groups: z.array(vacationGroupSchema),
    eventIds: z.array(z.string()),
    events: z.array(vacationEventSchema),
    amountType: amountTypesSchema,
    dependents: z.array(dependentSchema),
    createdByEvents: z.array(vacationEventSchema),
});
export type UserVacation = z.infer<typeof userVacationSchema>