import { getServerAuthSession } from "api/src/auth"
import {auth} from '@clerk/nextjs/server';
import type { Session } from "model/src/auth";

export const getAuthSession = async (): Promise<Session | undefined> => {
    const session = await getServerAuthSession(auth().userId);

    return session;
}