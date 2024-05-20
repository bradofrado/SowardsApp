import { auth } from '@clerk/nextjs/server';
import { getServerAuthSession } from 'api/src/auth';
import {getGroups} from 'api/src/routers/vacation/group'
import { prisma } from 'db/lib/prisma';
import { GroupList } from './components/group-list';
import { CreateGroup } from './components/create-group';

export default async function GroupPage(): Promise<JSX.Element> {
    const groups = await getGroups({db: prisma});

    const session = await getServerAuthSession(auth().userId);

    const myGroups = session ? groups.filter(group => group.users.findIndex(user => user.id === session.auth.user.id) > -1) : undefined;
    const publicGroups = groups.filter(group => group.isPublic && (!myGroups || !myGroups.includes(group)));
    return (
        <div>
            <CreateGroup/>
            {myGroups ? <GroupList groups={myGroups} label="My Groups" myGroups/> : null}
            <GroupList groups={publicGroups} label="Public Groups" myGroups={false}/>
        </div>
    )
}