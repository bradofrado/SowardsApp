import { redirect } from "next/navigation";
import { requireRoute } from "../../utils/protected-routes-hoc"
import { createUser } from "./components/actions"
import { SetupForm } from "./components/setup-form"

const redirectIfAuthed = requireRoute({redirect: '/', check: (session) => Boolean(session?.auth.userVacation)});
const SetupPage = async (): Promise<JSX.Element> => {
    const result = await redirectIfAuthed()();
    if (result.redirect) {
        redirect(result.redirect);
    }
    return (
        <SetupForm onSubmit={createUser}/>
    )
}

export default SetupPage