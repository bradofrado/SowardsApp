'use client';
import type { UserVacation } from "model/src/vacation";
import { createContext, useContext, useState } from "react";

interface UserContextOptions {
    user: UserVacation | undefined,
    setUser: (value: UserVacation | undefined) => void;
}
const UserContext = createContext<UserContextOptions>({user: undefined, setUser: () => undefined});

export const useUser = (): UserContextOptions => {
    return useContext(UserContext);
}

export const UserProvider: React.FunctionComponent<{user: UserVacation | undefined, children: React.ReactNode}> = ({user: _user, children}) => {
    const [user, setUser] = useState(_user);

    return <UserContext.Provider value={{user, setUser}}>
        {children}
    </UserContext.Provider>
}