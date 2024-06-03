import type { NextPage } from "next"
import { createUser } from "./components/actions"
import { SetupForm } from "./components/setup-form"

const SetupPage: NextPage = () => {
    return (
        <SetupForm onSubmit={createUser}/>
    )
}

export default SetupPage