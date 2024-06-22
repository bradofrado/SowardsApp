'use client'
import { useEffect, useState } from "react"
import { Button } from "ui/src/components/core/button"
import type { DropdownItem } from "ui/src/components/core/dropdown";
import { Dropdown } from "ui/src/components/core/dropdown"
import { Header } from "ui/src/components/core/header"
import { Label } from "ui/src/components/core/label"
import { useChangeProperty } from "ui/src/hooks/change-property"
import type { UserVacation, AmountType, VacationDependent } from "model/src/vacation";
import { Input } from "ui/src/components/core/input"


interface SetupFormProps {
    onUpdate: (user: UserVacation) => Promise<void>, 
    onConnect: (userVacationId: string) => Promise<void>,
    user: UserVacation

}
export const SetupForm: React.FunctionComponent<SetupFormProps> = ({onUpdate, onConnect, user: origUser}) => {
    const [userVacation, setUserVacation] = useState<UserVacation>(origUser);
    const changeProperty = useChangeProperty<UserVacation>(setUserVacation);
    const [loading, setLoading] = useState(false);
    const [loadingConnect, setLoadingConnect] = useState(false);

    useEffect(() => {
        //If this is a normal user and the origin user changes, update user vacation
        if (origUser.id !== userVacation.id) {
            setUserVacation(origUser);
        }
    }, [userVacation, origUser])

    const onCreate = (): void => {
        const submit = async (): Promise<void> => {
            setLoading(true);
            await onUpdate(userVacation)
            setLoading(false);
        }

        void submit();
    }

    const onConnectAccount = (): void => {
        const submit = async (): Promise<void> => {
            setLoadingConnect(true);
            await onConnect(userVacation.id)
            setLoadingConnect(false);
        }

        void submit();
    }

    return (<div className="flex flex-col gap-4">
        <Header>Edit Details for {userVacation.name} </Header>
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <Label label="Family Name">
                <Input onChange={changeProperty.formFunc('name', userVacation)} value={userVacation.name}/>
            </Label>
			{/* <Label className="sm:col-span-full" label="Groups">
                <VacationGroupDropdown onChange={changeProperty.formFunc('groupIds', userVacation)} value={userVacation.groupIds}/>
            </Label> */}
            <Label className="sm:col-span-full" label="Members">
                <p>Make sure your name is in this list</p>
                <DependentsForm dependents={userVacation.dependents} onChange={changeProperty.formFunc('dependents', userVacation)}/>
            </Label>
			<Button onClick={onCreate} loading={loading}>Update Information</Button>
            <Button onClick={onConnectAccount} loading={loadingConnect}>Connect Account</Button>
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