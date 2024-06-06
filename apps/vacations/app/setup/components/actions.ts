'use server';

import { createUserVacation, updateUserVacation } from "api/src/repositories/user-vacation";
import type { UserVacation, VacationDependent } from "model/src/vacation";
import { getAuthSession } from "../../../utils/auth";

export interface SetupUser {
    groupIds: string[],
    dependents: VacationDependent[],
    amountType: 'adult' | 'child'
}
export const createUser = async (user: UserVacation, _userId?: string): Promise<void> => {
    const session = await getAuthSession();
    if (!session?.auth.userId) return;

    const userId = !_userId || session.auth.user.roles[0] !== 'admin' ? session.auth.user.id : _userId;

    await createUserVacation({
        userId,
        amountType: user.amountType,
        groupIds: user.groupIds,
        groups: [],
        events: [],
        eventIds: [],
        id: '',
        dependents: user.dependents,
        createdByEvents: [],
        role: 'user'
    })
}

export const updateUser = async (user: UserVacation, _userId?: string): Promise<void> => {
    const session = await getAuthSession();
    if (!session?.auth.userId || !session.auth.userVacation) return;

    if (!user.id) {
        await createUser(user, _userId);
        return;
    }

    const userId = !_userId || session.auth.user.roles[0] !== 'admin' ? session.auth.user.id : _userId;

    await updateUserVacation({
        userId,
        amountType: user.amountType,
        groupIds: user.groupIds,
        groups: [],
        events: [],
        eventIds: [],
        id: user.id,
        dependents: user.dependents,
        createdByEvents: [],
        role: 'user'
    })
} 