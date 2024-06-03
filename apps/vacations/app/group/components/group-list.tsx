'use client';
import type { VacationGroup } from "model/src/vacation";
import { Card } from "ui/src/components/core/card";
import { Header } from "ui/src/components/core/header";
import { Pill } from 'ui/src/components/core/pill';
import { useState } from "react";
import type { DropdownItem } from "ui/src/components/core/dropdown";
import { useRouter } from "next/navigation";
import { api } from "../../../utils/api";
import { CreateGroupModal } from "./create-group";

export const GroupList: React.FunctionComponent<{groups: VacationGroup[], label: string, myGroups: boolean}> = ({groups, label, myGroups}) => {
    const [group, setGroup] = useState<VacationGroup | undefined>();
    const {mutate: updateGroup} = api.vacationGroup.updateGroup.useMutation();
    const {mutate: deleteGroup} = api.vacationGroup.deleteGroup.useMutation();
    const {mutate: joinGroup} = api.vacationGroup.joinGroup.useMutation();
    const {mutate: leaveGroup} = api.vacationGroup.leaveGroup.useMutation();

    const router = useRouter();
    const onClose = (): void => {
        setGroup(undefined);
    }

    const onSave = (_group: VacationGroup): void => {
        updateGroup(_group, {
            onSuccess() {
                setGroup(undefined);
                router.refresh();
            }
        })
    }

    const onDelete = (groupId: string): void => {
        deleteGroup(groupId, {
            onSuccess() {
                setGroup(undefined);
                router.refresh();
            }
        })
    }

    const onJoin = (groupId: string): void => {
        joinGroup(groupId, {
            onSuccess() {
                router.refresh();
            }
        })
    }

    const onLeave = (groupId: string): void => {
        leaveGroup(groupId, {
            onSuccess() {
                router.refresh();
            }
        })
    }

    const show = Boolean(group);
    return (
        <div>
            <Header>{label}</Header>
            {groups.map(_group => <GroupCard group={_group} key={_group.id} onDelete={() => {onDelete(_group.id)}} onUpdate={() => {setGroup(_group)}} onJoin={() => {onJoin(_group.id)}} onLeave={() => {onLeave(_group.id)}} isJoined={myGroups}/>)}
            {group ? <CreateGroupModal group={group} onClose={onClose} onSave={onSave} show={show}/> : null}
        </div>
    )
}

interface GroupCardProps {
    isJoined: boolean;
    group: VacationGroup, 
    onUpdate: () => void; 
    onDelete: () => void; 
    onJoin: () => void; 
    onLeave: () => void;
}
const GroupCard: React.FunctionComponent<GroupCardProps> = ({group, onUpdate, onDelete, onJoin, onLeave, isJoined}) => {
    const items: DropdownItem<string>[] = [
        {
            id: 'update',
            name: 'Update'
        },
    ];
    if (group.isPublic) {
        items.push({id: 'join', name: 'Join'});
    }
    if (isJoined) {
        items.push({id: 'leave', name: 'Leave'})
    }

    const onChange = (item: DropdownItem<string>): void => {
        if (item.id === 'update') {
            onUpdate();
        } else if (item.id === 'delete') {
            onDelete();
        } else if (item.id === 'join') {
            onJoin();
        } else if (item.id === 'leave') {
            onLeave();
        }
    }
    return (
        <Card items={items} label={group.name} onChange={onChange}>
            {group.users.filter(user => 'id' in user).map(user => <Pill key={user.id}>{`${user.firstname} ${user.lastname}`}</Pill>)}
        </Card>
    )
}