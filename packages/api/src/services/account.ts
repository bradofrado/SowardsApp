import type { Session } from "model/src/auth";
import type { UserVacation } from "model/src/vacation";
import { createAccount } from "../auth";
import { createUserVacation } from "../repositories/user-vacation";

export const createUser = async (
  user: UserVacation,
  session: Session | undefined,
): Promise<UserVacation | null> => {
  if (!session?.auth.userId) return null;

  if (!session.auth.user.id) {
    const newUser = await createAccount(session.auth.user, session.auth.userId);
    session.auth.user.id = newUser.id;
  }

  if (session.auth.userVacation?.id) {
    return session.auth.userVacation;
  }

  return createUserVacation(
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

export const createAccountFromName = async (
  name: string,
  session: Session,
): Promise<UserVacation | null> => {
  const user: UserVacation = {
    name,
    groupIds: [],
    groups: [],
    events: [],
    eventIds: [],
    id: "",
    createdByEvents: [],
    dependents: [],
  };
  return createUser(user, session);
};
