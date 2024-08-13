import { Button } from "ui/src/components/catalyst/button";
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from "ui/src/components/catalyst/dialog";
import {
  Form,
  FormDivider,
  FormRow,
} from "ui/src/components/catalyst/form/form";
import { Input, InputBlur } from "ui/src/components/core/input";
import { CategoryPicker } from "./category-picker";
import { useState } from "react";
import { CategoryBudget, SpendingRecord } from "model/src/budget";
import { useChangeProperty } from "ui/src/hooks/change-property";
import { DatePicker } from "ui/src/components/core/calendar/date-picker";
import { api } from "next-utils/src/utils/api";

interface AddTransactionModalProps {
  show: boolean;
  onClose: () => void;
  categories: CategoryBudget[];
}
export const AddTransactionModal: React.FunctionComponent<
  AddTransactionModalProps
> = ({ show, onClose, categories }) => {
  const [transaction, setTransaction] = useState<SpendingRecord>({
    amount: 0,
    category: null,
    date: new Date(),
    transactionId: "",
    description: "",
  });
  const changeProperty = useChangeProperty<SpendingRecord>(setTransaction);
  const { mutate: saveTransaction } = api.plaid.saveTransaction.useMutation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSave = () => {
    if (!transaction.category) {
      setError("Please select a category");
      return;
    }

    setLoading(true);
    saveTransaction(
      { transaction },
      {
        onSuccess() {
          setLoading(false);
          onClose();
        },
        onError(error) {
          setError(error.message);
        },
      },
    );
  };

  return (
    <Dialog open={show} onClose={onClose} size="2xl">
      <DialogTitle>Add Transaction</DialogTitle>
      <DialogDescription>Add a new transaction</DialogDescription>
      <DialogBody>
        <Form>
          <FormRow label="Amount" description="The amount of the transaction">
            <InputBlur
              value={transaction.amount}
              onChange={changeProperty.formFuncNumber("amount", transaction)}
            />
          </FormRow>
          <FormDivider />
          <FormRow label="Name" description="The name of the transaction">
            <Input
              value={transaction.description}
              onChange={changeProperty.formFunc("description", transaction)}
            />
          </FormRow>
          <FormDivider />
          <FormRow
            label="Category"
            description="The category of the transaction"
          >
            <CategoryPicker
              value={transaction.category?.id}
              onChange={changeProperty.formFunc("category", transaction)}
              categories={categories}
            />
          </FormRow>
          <FormDivider />
          <FormRow label="Date" description="The date of the transaction">
            <DatePicker
              date={transaction.date}
              onChange={changeProperty.formFunc("date", transaction)}
            />
          </FormRow>
        </Form>
        {error ? <p className="text-sm text-red-400 mt-4">{error}</p> : null}
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
