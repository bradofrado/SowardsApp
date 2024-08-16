"use client";

import { Budget } from "model/src/budget";
import { formatDollarAmount } from "model/src/utils";
import { Card } from "ui/src/components/core/card";

export const BudgetCard: React.FunctionComponent<{ budget: Budget }> = ({
  budget,
}) => {
  return (
    <Card className="hover:bg-gray-50 hover:cursor-pointer" label={budget.name}>
      <div className="grid grid-cols-2 gap-x-12">
        {budget.items.map((item) => (
          <>
            <div>{item.category.name}</div>
            <div>{formatDollarAmount(item.amount)}</div>
          </>
        ))}
      </div>
    </Card>
  );
};
