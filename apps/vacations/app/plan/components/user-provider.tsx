'use client';
import type { UserVacation } from "model/src/vacation";
import { useSearchParams } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

interface UserContextOptions {
    user: UserVacation | undefined,
    userId: string | undefined,
    setUser: (value: UserVacation | undefined) => void;
}
const UserContext = createContext<UserContextOptions>({user: undefined, setUser: () => undefined, userId: undefined});

export const useUser = (): UserContextOptions => {
    return useContext(UserContext);
}

export const UserProvider: React.FunctionComponent<{user: UserVacation | undefined, children: React.ReactNode, getUser: (id: string) => Promise<UserVacation | undefined>}> = ({user: _user, children, getUser}) => {
    const [user, setUser] = useState(_user);
    const params = useSearchParams();
    const userId = params.get('userId')
    useEffect(() => {
        if (userId && user?.userId !== userId) {
            void getUser(userId).then(fromServerUser => {
                setUser(fromServerUser);
            })
        }
    }, [userId, setUser, getUser, user])

    return <UserContext.Provider value={{user, setUser, userId: userId || undefined}}>
        {children}
    </UserContext.Provider>
}