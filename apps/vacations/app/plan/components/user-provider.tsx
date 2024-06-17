'use client';
import { UserVacation } from "model/src/vacation";
import { useSearchParams } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

interface UserContextOptions {
    user: UserVacation | undefined,
    userId: string | undefined,
    setUser: (value: UserVacation | undefined) => void;
    isAdmin: boolean
}
const UserContext = createContext<UserContextOptions>({user: undefined, setUser: () => undefined, userId: undefined, isAdmin: false});

export const useUser = (): UserContextOptions => {
    return useContext(UserContext);
}

interface UserProviderProps {
    user: UserVacation | undefined, 
    children: React.ReactNode, 
    getUser: (id: string) => Promise<UserVacation | undefined>
    isAdmin: boolean
}
export const UserProvider: React.FunctionComponent<UserProviderProps> = ({user: _user, children, getUser, isAdmin}) => {
    const [user, setUser] = useState(_user);
    const params = useSearchParams();
    const userId = params.get('userId')
    useEffect(() => {
        if (userId && user?.id !== userId) {
            void getUser(userId).then(fromServerUser => {
                setUser(fromServerUser);
            })
        }
    }, [userId, setUser, getUser, user])

    return <UserContext.Provider value={{user, setUser, userId: userId || undefined, isAdmin}}>
        {children}
    </UserContext.Provider>
}