'use server';

import { createUserVacation } from "api/src/repositories/user-vacation";
import { getAuthSession } from "../../../utils/auth";

export interface SetupUser {
    groupIds: string[], 
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
        id: ''
    })
}