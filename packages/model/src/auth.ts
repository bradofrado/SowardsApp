import { z } from "zod";
import { stringUnionSchema } from "./utils";
import { UserVacation } from "./vacation";

export type AuthContext = {
	userId: string;
	user: User,
  userVacation: UserVacation | undefined
};

export interface Session {
  auth: AuthContext,
}

export interface AuthedSession {
  auth: Omit<AuthContext, 'userVacation'> & {
    userVacation: UserVacation
  }
}

export const userSchema = z.object({
  id: z.string(),
  firstname: z.string(),
  lastname: z.string(),
  email: z.string(),
  roles: z.array(z.string()),
})
export type User = z.infer<typeof userSchema>;

export type Email = `${string}@${string}`;
export const emailSchema = z.custom<Email>((val) => {
  if (!(typeof val === "string")) return false;

  const indexOfAt = val.indexOf("@");

  //The @ symbol is not at the start or the end
  return indexOfAt > 0 && indexOfAt < val.length - 1;
});

const roles = ["user", "admin"] as const;
export type UserRole = (typeof roles)[number];
export const userRoleSchema = stringUnionSchema(roles);
