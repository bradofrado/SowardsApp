"use client";

import { Budget, CategoryBudget } from "model/src/budget";
import { formatDollarAmount } from "model/src/utils";
import { Card } from "ui/src/components/core/card";
import { UpdateBudgetModal } from "./new-budget";
import { useState } from "react";
import { api } from "next-utils/src/utils/api";

interface BudgetCardProps {
  categories: CategoryBudget[];
  budget: Budget;
}
export const BudgetCard: React.FunctionComponent<BudgetCardProps> = ({
  budget,
  categories,
}) => {
  const { mutate: saveBudget } = api.budget.updateBudget.useMutation();
  const [show, setShow] = useState(false);
  const onCardClick = () => setShow(true);

  const onSave = (budget: Budget): Promise<void> => {
    return new Promise<void>((resolve, reject) =>
      saveBudget(
        { budget },
        {
          onSuccess() {
            setShow(false);
            resolve();
          },
          onError() {
            reject();
          },
        },
      ),
    );
  };
  return (
    <>
      <Card label={budget.name} onClick={onCardClick}>
        <div className="grid grid-cols-2 gap-x-12">
          {budget.items.map((item) => (
            <>
              <div>{item.category.name}</div>
              <div>{formatDollarAmount(item.amount)}</div>
            </>
          ))}
        </div>
      </Card>
      <UpdateBudgetModal
        show={show}
        onClose={() => setShow(false)}
        budget={budget}
        categories={categories}
        title="Edit Budget"
        description="Edit the budget to plan for your future!"
        onSave={onSave}
      />
    </>
  );
};
