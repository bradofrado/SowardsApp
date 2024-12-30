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
import {
  DropdownLineItem,
  ListBox,
  ListBoxPopover,
} from "ui/src/components/core/dropdown";
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
  const [items, setItems] = useState<{ item: BudgetItem; amount: number }[]>(
    [],
  );
  const [goals, setGoals] = useState<{ item: SavingsGoal; amount: number }[]>(
    [],
  );
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

  const onAddTransfer = (item: BudgetItem | SavingsGoal): void => {
    if (itemsProps.includes(item as BudgetItem))
      setItems((prev) => [...prev, { item: item as BudgetItem, amount: 0 }]);
    else
      setGoals((prev) => [
        ...prev,
        {
          item: item as SavingsGoal,
          amount: calculateCadenceMonthlyAmount(item),
        },
      ]);
  };
  return (
    <Dialog open={show} onClose={onClose}>
      <DialogTitle>Transfer Funds</DialogTitle>
      <DialogDescription>
        Transfer the funds from your available amount of net worth to the
        savings goals and variable expenses.
      </DialogDescription>
      <DialogBody>
        <ListBox
          items={[...itemsProps, ...goalsProps].map((item) => ({
            id: item.id,
            name: (
              <DropdownLineItem onClick={() => onAddTransfer(item)}>
                {item.category.name}
              </DropdownLineItem>
            ),
          }))}
        >
          Add Transfer
        </ListBox>

        {items.length > 0 ? (
          <FormSection label="Expenses">
            {items.map(({ item, amount }, i) => (
              <Label
                className="justify-between"
                key={item.id}
                label={item.category.name}
                sameLine
              >
                <InputBlur
                  value={amount}
                  onChange={(value) =>
                    changeItems(items, i, "amount", parseFloat(value))
                  }
                />
              </Label>
            ))}
          </FormSection>
        ) : null}
        {goals.length > 0 ? (
          <>
            <FormDivider />
            <FormSection label="Goals">
              {goals.map(({ item, amount }, i) => (
                <Label
                  className="justify-between"
                  key={item.id}
                  label={item.category.name}
                  sameLine
                >
                  <InputBlur
                    value={amount}
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
