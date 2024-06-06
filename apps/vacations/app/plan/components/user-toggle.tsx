'use client'
import { User } from "model/src/auth";
import { UserVacation } from "model/src/vacation";
import { Dropdown, DropdownItem } from "ui/src/components/core/dropdown";
import { useUser } from "./user-provider";

interface UserToggleProps {
    users: User[],
    getUser: (id: string) => Promise<UserVacation | undefined>;
}
export const UserToggle: React.FunctionComponent<UserToggleProps> = ({users, getUser}) => {
    const {setUser, user} = useUser();
    const items: DropdownItem<string>[] = users.map(user => ({id: user.id, name: `${user.firstname} ${user.lastname}`}))
    const onChange = (item: DropdownItem<string>): void => {
        void getUser(item.id).then(user => {
            setUser(user)
        })
    }
    return (
        <Dropdown items={items} onChange={onChange} initialValue={user?.userId}/>
    )
}