import { Session } from "model/src/auth";
import { UserVacation } from "model/src/vacation";
import { createAccount } from "../auth";
import { createUserVacation } from "../repositories/user-vacation";

export const createUser = async (
  user: UserVacation,
  session: Session | undefined,
): Promise<void> => {
  if (!session?.auth.userId) return;

  if (!session.auth.user.id) {
    const newUser = await createAccount(session.auth.user, session.auth.userId);
    session.auth.user.id = newUser.id;
  }

  await createUserVacation(
    {
      name: user.name,
      groupIds: user.groupIds,
      groups: [],
      events: [],
      eventIds: [],
      id: "",
      dependents: user.dependents,
      createdByEvents: [],
    },
    session.auth.user.id,
  );
};
