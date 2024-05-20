'use client'

import type { VacationGroup } from "model/src/vacation"
import { useState } from "react"
import { Button } from "ui/src/components/core/button"
import { CheckboxInput, Input } from "ui/src/components/core/input"
import { Label } from "ui/src/components/core/label"
import { BaseModal } from "ui/src/components/core/modal"
import { useChangeProperty } from "ui/src/hooks/change-property"
import { useRouter } from "next/navigation"
import { api } from "../../../utils/api"

export const CreateGroup: React.FunctionComponent = () => {
    const [show, setShow] = useState(false);
    const {mutate: createGroup} = api.vacationGroup.createGroup.useMutation();
    const router = useRouter();
    const onClose = (): void => {
        setShow(false);
    }
    const onShow = (): void => {
        setShow(true);
    }
    const onSave = (group: VacationGroup): void => {
        createGroup(group, {
            onSuccess() {
                setShow(false);
                router.refresh();
            }
        })
    }
    return (<>
        <Button onClick={onShow}>Create Group</Button>
        <CreateGroupModal group={{id: '', name: 'My Group', users: [], isPublic: false}} onClose={onClose} onSave={onSave} show={show}/>
    </>)
}

export const CreateGroupModal: React.FunctionComponent<{show: boolean, onClose: () => void, group: VacationGroup, onSave: (group: VacationGroup) => void}> = ({show, onClose, group: groupProps, onSave}) => {
    const [group, setGroup] = useState(groupProps);
    const changeProperty = useChangeProperty<VacationGroup>(setGroup);
    return (
        <BaseModal onClose={onClose} show={show}>
            <div>
                <Label label="Name">
                    <Input onChange={changeProperty.formFunc('name', group)} value={group.name}/>
                </Label>
                <Label label="Is Public">
                    <CheckboxInput className="w-fit" onChange={(value) => changeProperty(group, 'isPublic', value)} value={group.isPublic}/>
                </Label>
                <Button onClick={() => {onSave(group)}}>Save</Button>
            </div>
        </BaseModal>
    )
}