'use server';

import { createUserVacation, updateUserVacation } from "api/src/repositories/user-vacation";
import type { VacationDependent } from "model/src/vacation";
import { getAuthSession } from "../../../utils/auth";

export interface SetupUser {
    groupIds: string[],
    dependents: VacationDependent[],
    amountType: 'adult' | 'child'
}
export const createUser = async (user: SetupUser): Promise<void> => {
    const session = await getAuthSession();
    if (!session?.auth.userId) return;

    await createUserVacation({
        userId: session.auth.user.id,
        amountType: user.amountType,
        groupIds: user.groupIds,
        groups: [],
        events: [],
        eventIds: [],
        id: '',
        dependents: user.dependents,
        createdByEvents: []
    })
}

export const updateUser = async (user: SetupUser): Promise<void> => {
    const session = await getAuthSession();
    if (!session?.auth.userId || !session.auth.userVacation) return;

    await updateUserVacation({
        userId: session.auth.user.id,
        amountType: user.amountType,
        groupIds: user.groupIds,
        groups: [],
        events: [],
        eventIds: [],
        id: session.auth.userVacation.id,
        dependents: user.dependents,
        createdByEvents: []
    })
} 