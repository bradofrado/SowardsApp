"use server";

import {
  createUserVacation,
  updateUserVacation,
} from "api/src/repositories/user-vacation";
import type { UserVacation, VacationDependent } from "model/src/vacation";
import { connectAccountToUserVacation, createAccount } from "api/src/auth";
import { getAuthSession } from "../utils/auth";
import { createUser as createUserService } from "api/src/services/account";

export interface SetupUser {
  groupIds: string[];
  dependents: VacationDependent[];
  amountType: "adult" | "child";
}
export const createUser = async (
  user: UserVacation,
): Promise<UserVacation | null> => {
  const session = await getAuthSession();
  return createUserService(user, session);
};

export const connectUser = async (userVacationId: string): Promise<void> => {
  const session = await getAuthSession();
  if (!session?.auth.userId) return;

  await connectAccountToUserVacation(session.auth.user.id, userVacationId);
};

export const connectSessionToUserVacation = async (
  userVacationId: string,
): Promise<void> => {
  const session = await getAuthSession();
  if (!session?.auth.userId) return;

  await connectAccountToUserVacation(session.auth.user.id, userVacationId);
};

export const updateUser = async (user: UserVacation): Promise<void> => {
  const session = await getAuthSession();
  if (!session?.auth.userId) return;

  if (!session.auth.user.id) {
    const newUser = await createAccount(session.auth.user, session.auth.userId);
    session.auth.user.id = newUser.id;
  }

  if (!user.id) {
    await createUser(user);
    return;
  }

  await updateUserVacation({
    name: user.name,
    groupIds: user.groupIds,
    groups: [],
    events: [],
    eventIds: [],
    id: user.id,
    dependents: user.dependents,
    createdByEvents: [],
  });

  await connectUser(user.id);
};
