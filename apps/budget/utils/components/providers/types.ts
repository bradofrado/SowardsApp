import { SpendingRecord } from "model/src/budget";

export interface SavingsAccount {
  name: string;
  monthlyContribution: number;
  totalSaved: number;
  targetAmount: number;
  transactions: SpendingRecord[];
}
