'use client'
import type { UserVacation } from "model/src/vacation"
import { useState } from "react"
import type { DropdownItem } from "ui/src/components/core/dropdown";
import { Dropdown } from "ui/src/components/core/dropdown"
import { Header } from "ui/src/components/core/header"
import { SetupForm } from "./setup-form"

interface ConnectAccountFormProps {
    users: UserVacation[]
    onUpdate: (user: UserVacation) => Promise<void>
    onConnect: (userVacationId: string) => Promise<void>
    user: UserVacation
}
export const ConnectAccountForm: React.FunctionComponent<ConnectAccountFormProps> = ({users, onUpdate, onConnect, user: origUser}) => {
    const [selectedUser, setSelectedUser] = useState<UserVacation>(origUser);

    const items: DropdownItem<string>[] = [...users, {id: '', name: 'Create New Family', createdByEvents: [], dependents: [], eventIds: [], events: [], groupIds: [], groups: []}];
    return (
        <div className="flex gap-4 flex-col">
            <Header>Connect Or Create Account</Header>
            <div className="w-fit">
                <Dropdown initialValue={selectedUser.id} items={items} onChange={(item) => {setSelectedUser(item as UserVacation)}}>
                    Select Account
                </Dropdown>
            </div>
            <SetupForm onUpdate={onUpdate} onConnect={onConnect} user={selectedUser}/>
        </div>
    )
}