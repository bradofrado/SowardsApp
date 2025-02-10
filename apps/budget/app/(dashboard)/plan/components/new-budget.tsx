"use client";

import { Budget, CategoryBudget } from "model/src/budget";
import { api } from "next-utils/src/utils/api";
import { useState } from "react";
import { Button } from "ui/src/components/catalyst/button";
import { UpdateBudgetModal } from "../../../../utils/components/budget/update-budget-modal";

export const NewBudgetButton: React.FunctionComponent<{
  className?: string;
  categories: CategoryBudget[];
}> = ({ className, categories }) => {
  const { mutate: createBudget } = api.budget.createBudget.useMutation();
  const [show, setShow] = useState(false);

  const onCreate = (budget: Budget): Promise<void> => {
    return new Promise<void>((resolve, reject) =>
      createBudget(
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
      <Button className={className} onClick={() => setShow(true)}>
        New Budget
      </Button>
      <UpdateBudgetModal
        show={show}
        onClose={() => setShow(false)}
        categories={categories}
        onSave={onCreate}
        budget={{
          id: "",
          name: "New Budget",
          items: [],
        }}
        title="Create Budget"
        description="Create a new budget template to plan for your future!"
      />
    </>
  );
};
