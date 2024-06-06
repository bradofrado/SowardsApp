import { getUsers } from "api/src/auth";
import { getAuthSession } from "../../utils/auth"
import { UserProvider } from "../plan/components/user-provider";
import { UserToggle } from "../plan/components/user-toggle";
import { createUser, updateUser } from "./components/actions"
import { SetupForm } from "./components/setup-form"
import { getUser } from "../plan/actions";

const SetupPage = async (): Promise<JSX.Element> => {
    const session = await getAuthSession();
    const onSubmit = session?.auth.userVacation ? updateUser : createUser;
    const user = session?.auth.userVacation || {id: '', amountType: 'adult', createdByEvents: [], dependents: [], eventIds: [], events: [], groupIds: [], groups: [], role: 'user', userId: ''};
    const users = await getUsers();
    return (
        <UserProvider user={user} getUser={getUser}>
            <UserToggle users={users} getUser={getUser}/>
            <SetupForm onSubmit={onSubmit} user={user}/>
        </UserProvider>
    )
}

export default SetupPage