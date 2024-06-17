import { CreateGroup } from './components/create-group';
import { requireUserVacation } from '../../utils/protected-routes-hoc';
import { redirect } from 'next/navigation';

export default async function GroupPage(): Promise<JSX.Element> {
    const result = await requireUserVacation()();
    if (result.redirect) {
        redirect(result.redirect);
    }

    //const groups = await getGroups({db: prisma});

    //const session = result.session;

    //const myGroups = session ? groups.filter(group => group.users.filter(user => 'id' in user).findIndex(user => user.id === session.auth.user.id) > -1) : undefined;
    //const publicGroups = groups.filter(group => group.isPublic && (!myGroups || !myGroups.includes(group)));
    return (
        <div>
            <CreateGroup/>
            {/* {myGroups ? <GroupList groups={myGroups} label="My Groups" myGroups/> : null} */}
            {/* <GroupList groups={publicGroups} label="Public Groups" myGroups={false}/> */}
        </div>
    )
}