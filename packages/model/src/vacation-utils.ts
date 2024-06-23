import { UserVacation } from "./vacation";

export function getTotalDependents(users: UserVacation[]): number {
  return users.reduce((prev, curr) => prev + curr.dependents.length, 0);
}
