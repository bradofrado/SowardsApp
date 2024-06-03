import { getAuthSession } from "../../utils/auth"
import { createUser, SetupUser, updateUser } from "./components/actions"
import { SetupForm } from "./components/setup-form"

const SetupPage = async (): Promise<JSX.Element> => {
    const session = await getAuthSession();
    const onSubmit = session?.auth.userVacation ? updateUser : createUser;
    const user: SetupUser = session?.auth.userVacation ? {
        groupIds: session.auth.userVacation.groupIds,
        amountType: session.auth.userVacation.amountType as 'adult' | 'child',
        dependents: session.auth.userVacation.dependents
    } : {
        amountType: 'adult',
        groupIds: [],
        dependents: []
    }
    return (
        <SetupForm onSubmit={onSubmit} user={user}/>
    )
}

export default SetupPage