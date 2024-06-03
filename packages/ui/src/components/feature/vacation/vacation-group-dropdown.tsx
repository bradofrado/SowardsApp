import type { VacationGroup } from "model/src/vacation";
import type { DropdownItem} from "../../core/dropdown";
import { Dropdown } from "../../core/dropdown";
import { Pill } from "../../core/pill";

export interface VacationGroupDropdownProps {
    value: string[];
    onChange: (values: string[]) => void;
    groups: VacationGroup[]
}
export const VacationGroupDropdown: React.FunctionComponent<VacationGroupDropdownProps> = ({value: groupIds, onChange, groups}) => {
    const groupItems: DropdownItem<string>[] | undefined = groups.map(d => ({id: d.id, name: d.name}));
    const itemsLeft = groupItems.filter(item => !groupIds.includes(item.id));

    const onGroupAdd = (item: DropdownItem<string>): void => {
        const copy = groupIds.slice();
        copy.push(item.id);
        onChange(copy);
    }

    const onGroupRemove = (groupId: string): void => {
        const copy = groupIds.slice();
        const index = copy.indexOf(groupId);
        if (index === -1) return;
        copy.splice(index, 1);
        onChange(copy);
    } 
    
    return <>
        {groupIds.map(groupId => <Pill key={groupId} onClose={() => {onGroupRemove(groupId)}}>{groupItems.find(g => groupId === g.id)?.name as string | undefined ?? 'Invalid Group'}</Pill>)}
        {itemsLeft.length > 0 ? <Dropdown className="w-fit" items={itemsLeft} onChange={onGroupAdd}>Add Group</Dropdown> : null}
    </>
}