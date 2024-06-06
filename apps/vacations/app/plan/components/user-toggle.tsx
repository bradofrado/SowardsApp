'use client'
import { User } from "model/src/auth";
import { UserVacation } from "model/src/vacation";
import { Dropdown, DropdownItem } from "ui/src/components/core/dropdown";
import { useUser } from "./user-provider";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

interface UserToggleProps {
    users: User[],
    getUser: (id: string) => Promise<UserVacation | undefined>;
}
export const UserToggle: React.FunctionComponent<UserToggleProps> = ({users, getUser}) => {
    const {setUser, userId} = useUser();
    const router = useRouter();
    
    const items: DropdownItem<string>[] = users.map(_user => ({id: _user.id, name: `${_user.firstname} ${_user.lastname}`}))
    const onChange = (item: DropdownItem<string>): void => {
        void getUser(item.id).then(_user => {
            setUser(_user);
        })
        router.push(`?userId=${item.id}`)
    }
    return (
        <Dropdown items={items} onChange={onChange} initialValue={userId}/>
    )
}