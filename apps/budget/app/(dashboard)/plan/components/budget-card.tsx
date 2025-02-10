"use client";

import { Budget, CategoryBudget } from "model/src/budget";
import { formatDollarAmount } from "model/src/utils";
import { Card } from "ui/src/components/core/card";
import { useState } from "react";
import { api } from "next-utils/src/utils/api";
import { useUpdateBudget } from "../../../../utils/hooks/update-budget";
import { UpdateBudgetModal } from "../../../../utils/components/budget/update-budget-modal";

interface BudgetCardProps {
  categories: CategoryBudget[];
  budget: Budget;
}
export const BudgetCard: React.FunctionComponent<BudgetCardProps> = ({
  budget,
  categories,
}) => {
  const saveBudget = useUpdateBudget();
  const [show, setShow] = useState(false);
  const onCardClick = () => setShow(true);

  const onSave = async (budget: Budget): Promise<void> => {
    await saveBudget(budget);
    setShow(false);
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
