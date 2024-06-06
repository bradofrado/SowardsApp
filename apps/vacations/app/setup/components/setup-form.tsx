'use client'
import { useEffect, useState } from "react"
import { Button } from "ui/src/components/core/button"
import type { DropdownItem } from "ui/src/components/core/dropdown";
import { Dropdown } from "ui/src/components/core/dropdown"
import { Header } from "ui/src/components/core/header"
import { Label } from "ui/src/components/core/label"
import { useChangeProperty } from "ui/src/hooks/change-property"
import { UserVacation, type AmountType, type VacationDependent } from "model/src/vacation"
import { Input } from "ui/src/components/core/input"
import { useUser } from "../../plan/components/user-provider";


export const SetupForm: React.FunctionComponent<{onSubmit: (user: UserVacation, userId?: string) => Promise<void>, user: UserVacation}> = ({onSubmit, user: origUser}) => {
    const {user, userId} = useUser();
    const [userVacation, setUserVacation] = useState<UserVacation>(userId ? user || {id: '', amountType: 'adult', createdByEvents: [], dependents: [], eventIds: [], events: [], groupIds: [], groups: [], role: 'user', userId: ''} : origUser);
    const changeProperty = useChangeProperty<UserVacation>(setUserVacation);

    useEffect(() => {
        if (user && user.id !== userVacation.id) {
            setUserVacation(user);
        } else if (userId && !user && userVacation.id !== '') {
            setUserVacation({id: '', amountType: 'adult', createdByEvents: [], dependents: [], eventIds: [], events: [], groupIds: [], groups: [], role: 'user', userId: ''})
        }
    }, [user, userVacation, userId])

    return (<div className="flex flex-col gap-4">
        <Header>Setup Account for </Header>
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <Label className="sm:col-span-full" label="Person Type">
                <AmountTypeDropdown onChange={changeProperty.formFunc('amountType', userVacation)} value={userVacation.amountType}/>
            </Label>
			{/* <Label className="sm:col-span-full" label="Groups">
                <VacationGroupDropdown onChange={changeProperty.formFunc('groupIds', userVacation)} value={userVacation.groupIds}/>
            </Label> */}
            <Label className="sm:col-span-full" label="Dependents">
                <DependentsForm dependents={userVacation.dependents} onChange={changeProperty.formFunc('dependents', userVacation)}/>
            </Label>
			<Button onClick={() => onSubmit(userVacation, userId)}>Create Account</Button>
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