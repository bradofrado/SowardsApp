import { Budget, CategoryBudget } from "model/src/budget";
import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogActions,
} from "ui/src/components/catalyst/dialog";
import { BudgetForm } from "./budget-form";
import { Button } from "ui/src/components/catalyst/button";

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
