'use client'
import { useState } from "react"
import { Button } from "ui/src/components/core/button"
import type { DropdownItem } from "ui/src/components/core/dropdown";
import { Dropdown } from "ui/src/components/core/dropdown"
import { Header } from "ui/src/components/core/header"
import { Label } from "ui/src/components/core/label"
import { useChangeProperty } from "ui/src/hooks/change-property"
import type { AmountType, VacationDependent } from "model/src/vacation"
import { Input } from "ui/src/components/core/input"
import { VacationGroupDropdown } from "../../../utils/vacation-group-dropdown";
import type { SetupUser } from "./actions";


export const SetupForm: React.FunctionComponent<{onSubmit: (user: SetupUser) => Promise<void>, user: SetupUser}> = ({onSubmit, user}) => {
    const [userVacation, setUserVacation] = useState<SetupUser>(user);
    const changeProperty = useChangeProperty<SetupUser>(setUserVacation);

    return (<div className="flex flex-col gap-4">
        <Header>Setup Account for </Header>
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
			<Label className="sm:col-span-full" label="Person Type">
                <AmountTypeDropdown onChange={changeProperty.formFunc('amountType', userVacation)} value={userVacation.amountType}/>
            </Label>
			<Label className="sm:col-span-full" label="Groups">
                <VacationGroupDropdown onChange={changeProperty.formFunc('groupIds', userVacation)} value={userVacation.groupIds}/>
            </Label>
            <Label className="sm:col-span-full" label="Dependents">
                <DependentsForm dependents={userVacation.dependents} onChange={changeProperty.formFunc('dependents', userVacation)}/>
            </Label>
			<Button onClick={() => onSubmit(userVacation)}>Create Account</Button>
		</div>
    </div>)
}

const AmountTypeDropdown: React.FunctionComponent<{value: AmountType, onChange: (value: AmountType) => void}> = ({value, onChange}) => {
    const items: DropdownItem<AmountType>[] = [{id: 'adult', name: 'Adult'}, {id: 'child', name: 'Child'}];

    return (
        <Dropdown className="w-full" initialValue={value} items={items} onChange={(item) => { onChange(item.id); }}/>
    )
}
const DependentsForm: React.FunctionComponent<{dependents: VacationDependent[], onChange: (values: VacationDependent[]) => void}> = ({dependents, onChange}) => {
   const onDependentChange = (value: VacationDependent, index: number): void => {
        const copy = dependents.slice();
        copy[index] = value;
        onChange(copy);
    }

    const onAddDependent = (): void => {
        const copy = dependents.slice();
        copy.push({id: '', firstname: '', lastname: '', amountType: 'adult'});
        onChange(copy);
    }

    const onRemoveDependent = (index: number): void => {
        const copy = dependents.slice();
        copy.splice(index, 1);
        onChange(copy);
    }
    
    return (
        <div>
            {dependents.map((dependent, i) => <DependentItem key={dependent.id} onChange={(value) => {onDependentChange(value, i)}} onRemove={() => {onRemoveDependent(i)}} value={dependent}/>)}
            <Button onClick={onAddDependent}>Add</Button>
        </div>
    )
}

const DependentItem: React.FunctionComponent<{value: VacationDependent, onChange: (value: VacationDependent) => void, onRemove: () => void}> = ({value, onChange, onRemove}) => {
    const changeProperty = useChangeProperty(onChange);
    return (
        <div >
            <Label label="First name">
                <Input onChange={changeProperty.formFunc('firstname', value)} value={value.firstname}/>
            </Label>
            <Label label="Last name">
                <Input onChange={changeProperty.formFunc('lastname', value)} value={value.lastname}/>
            </Label>
            <Label label="Amount Type">
                <AmountTypeDropdown onChange={changeProperty.formFunc('amountType', value)} value={value.amountType}/>
            </Label>
            <Button onClick={onRemove}>Remove</Button>
        </div>
    )
}