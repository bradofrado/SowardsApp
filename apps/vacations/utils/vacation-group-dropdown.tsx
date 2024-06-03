'use client'
import type { VacationGroupDropdownProps} from 'ui/src/components/feature/vacation/vacation-group-dropdown';
import {VacationGroupDropdown as Raw} from 'ui/src/components/feature/vacation/vacation-group-dropdown';
import { api } from './api';

export const VacationGroupDropdown: React.FunctionComponent<Omit<VacationGroupDropdownProps, 'groups'>> = (props) => {
    const query = api.vacationGroup.getGroups.useQuery();
    
    return (
        <Raw groups={query.data || []} {...props}/>
    )
}