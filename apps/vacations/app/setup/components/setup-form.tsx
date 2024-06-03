'use client'
import { useState } from "react"
import { Button } from "ui/src/components/core/button"
import { Dropdown } from "ui/src/components/core/dropdown"
import { Header } from "ui/src/components/core/header"
import { Label } from "ui/src/components/core/label"
import { useChangeProperty } from "ui/src/hooks/change-property"
import { VacationGroupDropdown } from "../../../utils/vacation-group-dropdown"

interface SetupUser {
    groupIds: string[], 
    amountType: 'adult' | 'child'
}
export const SetupForm: React.FunctionComponent<{onSubmit: (user: SetupUser) => Promise<void>}> = ({onSubmit}) => {
    const [userVacation, setUserVacation] = useState<SetupUser>({amountType: 'adult', groupIds: []});
    const changeProperty = useChangeProperty<SetupUser>(setUserVacation);

    return (<div className="flex flex-col gap-4">
        <Header>Setup Account for </Header>
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
			<Label className="sm:col-span-full" label="Person Type">
				<Dropdown className="w-full" initialValue={userVacation.amountType} items={[{id: 'adult', name: 'Adult'}, {id: 'child', name: 'Child'}]}/>
			</Label>
			<Label className="sm:col-span-full" label="Groups">
                <VacationGroupDropdown onChange={changeProperty.formFunc('groupIds', userVacation)} value={userVacation.groupIds}/>
            </Label>
			<Button onClick={() => onSubmit(userVacation)}>Create Account</Button>
		</div>
    </div>)
}