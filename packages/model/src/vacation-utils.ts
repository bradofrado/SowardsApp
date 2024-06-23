import { AmountType, UserVacation } from "./vacation";

export function getTotalDependents(users: UserVacation[]): number {
  return users.reduce((prev, curr) => prev + curr.dependents.length, 0);
}

export const getAmountOfPeople = <T extends { amountType: AmountType }>(
  userLike: T[],
  callback?: (item: T) => { child: number; adult: number },
): { child: number; adult: number } => {
  return userLike.reduce(
    (prev, curr) => {
      if (curr.amountType === "adult") {
        prev.adult += 1;
      } else if (curr.amountType === "child") {
        prev.child += 1;
      }

      if (callback) {
        const res = callback(curr);
        prev.adult += res.adult;
        prev.child += res.child;
      }

      return prev;
    },
    { adult: 0, child: 0 },
  );
};
