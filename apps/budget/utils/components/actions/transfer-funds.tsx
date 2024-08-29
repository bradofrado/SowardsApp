import {
  BudgetItem,
  calculateCadenceMonthlyAmount,
  SavingsGoal,
} from "model/src/budget";
import { api } from "next-utils/src/utils/api";
import { useState } from "react";
import { Button } from "ui/src/components/catalyst/button";
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from "ui/src/components/catalyst/dialog";
import { FormDivider, FormSection } from "ui/src/components/catalyst/form/form";
import { InputBlur } from "ui/src/components/core/input";
import { Label } from "ui/src/components/core/label";
import { useChangeArray } from "ui/src/hooks/change-property";

interface TransferFundsModalProps {
  show: boolean;
  onClose: () => void;
  items: BudgetItem[];
  goals: SavingsGoal[];
}
export const TransferFundsModal: React.FunctionComponent<
  TransferFundsModalProps
> = ({ show, onClose, items: itemsProps, goals: goalsProps }) => {
  const [items, setItems] = useState(itemsProps);
  const [goals, setGoals] = useState(goalsProps);
  const changeItems = useChangeArray(setItems);
  const changeGoals = useChangeArray(setGoals);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { mutate: transferFunds } = api.budget.transferFunds.useMutation();

  const onTransfer = (): void => {
    setLoading(true);
    transferFunds(
      { items, goals },
      {
        onSuccess() {
          onClose();
        },
        onError() {
          setLoading(false);
          setError("There wasn an error transferring funds");
        },
      },
    );
  };
  return (
    <Dialog open={show} onClose={onClose}>
      <DialogTitle>Transfer Funds</DialogTitle>
      <DialogDescription>
        Transfer the funds from your available amount of net worth to the
        savings goals and variable expenses.
      </DialogDescription>
      <DialogBody>
        {items.length > 0 ? (
          <FormSection label="Expenses">
            {items.map((item, i) => (
              <Label
                className="justify-between"
                key={item.id}
                label={item.category.name}
                sameLine
              >
                <InputBlur
                  value={calculateCadenceMonthlyAmount(item)}
                  onChange={(value) =>
                    changeItems(items, i, "amount", parseFloat(value))
                  }
                  disabled
                />
              </Label>
            ))}
          </FormSection>
        ) : null}
        {goals.length > 0 ? (
          <>
            <FormDivider />
            <FormSection label="Goals">
              {goals.map((item, i) => (
                <Label
                  className="justify-between"
                  key={item.id}
                  label={item.category.name}
                  sameLine
                >
                  <InputBlur
                    value={calculateCadenceMonthlyAmount(item)}
                    onChange={(value) =>
                      changeGoals(goals, i, "amount", parseFloat(value))
                    }
                    disabled
                  />
                </Label>
              ))}
            </FormSection>
          </>
        ) : null}
        {error ? <p className="text-red-400 text-sm mt-2">{error}</p> : null}
      </DialogBody>
      <DialogActions>
        <Button plain onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onTransfer} loading={loading}>
          Transfer
        </Button>
      </DialogActions>
    </Dialog>
  );
};
