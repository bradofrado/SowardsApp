"use client";

import { Budget, BudgetItem, CategoryBudget } from "model/src/budget";
import { api } from "next-utils/src/utils/api";
import { useState } from "react";
import { Button } from "ui/src/components/catalyst/button";
import {
  DialogBody,
  DialogDescription,
  DialogTitle,
  Dialog,
  DialogActions,
} from "ui/src/components/catalyst/dialog";
import { BudgetForm } from "../../../../utils/components/budget/budget-form";

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

interface UpdateBudgetModalProps {
  show: boolean;
  onClose: () => void;
  budget: Budget;
  categories: CategoryBudget[];
  onSave: (budget: Budget) => Promise<void>;
  title: string;
  description: string;
}
export const UpdateBudgetModal: React.FunctionComponent<
  UpdateBudgetModalProps
> = ({
  show,
  onClose,
  categories,
  onSave: onSaveProps,
  budget: budgetProps,
  title,
  description,
}) => {
  const [budget, setBudget] = useState<Budget>(budgetProps);
  const [loading, setLoading] = useState(false);

  const onSave = () => {
    setLoading(true);
    onSaveProps(budget).then(() => {
      setLoading(false);
    });
  };

  return (
    <Dialog open={show} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogDescription>{description}</DialogDescription>
      <DialogBody>
        <BudgetForm
          budget={budget}
          onChange={setBudget}
          categories={categories}
        />
      </DialogBody>
      <DialogActions>
        <Button onClick={onClose} plain>
          Cancel
        </Button>
        <Button onClick={onSave} loading={loading}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
