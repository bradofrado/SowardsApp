import {
  CategoryBudget,
  SpendingRecord,
  TransactionCategory,
} from "model/src/budget";
import { Replace } from "model/src/core/utils";
import { formatDollarAmount, groupBy, round } from "model/src/utils";
import { useState } from "react";
import { Button } from "ui/src/components/catalyst/button";
import { Dialog, DialogActions } from "ui/src/components/catalyst/dialog";
import { Heading } from "ui/src/components/catalyst/heading";
import { InputBlur } from "ui/src/components/core/input";
import { Label } from "ui/src/components/core/label";
import { useChangeArray } from "ui/src/hooks/change-property";

interface CategoryPickerProps {
  categories: CategoryBudget[];
  onChange: (category: CategoryBudget) => void;
  values: TransactionCategory[];
}
export const CategoryPicker: React.FunctionComponent<CategoryPickerProps> = ({
  onChange,
  values,
  categories,
}) => {
  const groupedCategories = groupBy(categories, "type");
  return (
    <div>
      <Heading>Expenses</Heading>
      <div className="grid gap-y-2 grid-cols-3">
        {groupedCategories.expense.map((category) => (
          <Button
            className="items-start"
            key={category.id}
            onClick={() => onChange(category)}
            plain={
              (values.find((value) => value.category.id === category.id) ===
                undefined) as true
            }
          >
            {category.name}
          </Button>
        ))}
      </div>
      <Heading>Income</Heading>
      <div className="grid gap-y-2 grid-cols-3">
        {groupedCategories.income.map((category) => (
          <Button
            className="items-start"
            key={category.id}
            onClick={() => onChange(category)}
            plain={
              (values.find((value) => value.category.id === category.id) ===
                undefined) as true
            }
          >
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

type CategoryPickerModalProps = Replace<
  CategoryPickerProps,
  "onChange",
  (transactionCategories: TransactionCategory[]) => void
> & {
  show: boolean;
  onClose: () => void;
  transaction: SpendingRecord | undefined;
};
export const CategoryPickerModal: React.FunctionComponent<
  CategoryPickerModalProps
> = ({ show, onClose, onChange: onChangeProps, ...props }) => {
  const transaction = props.transaction;
  if (!transaction) return null;

  const onChange = (category: CategoryBudget) => {
    onChangeProps([
      {
        id: "",
        category,
        amount: transaction.amount,
        transactionId: transaction.transactionId,
      },
    ]);
    onClose();
  };
  const onRemove = (): void => {
    onChangeProps([]);
    onClose();
  };
  return (
    <Dialog open={show} onClose={onClose}>
      <CategoryPicker {...props} onChange={onChange} />
      <DialogActions>
        <Button onClick={onRemove} plain>
          Remove
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const CategorySplitModal: React.FunctionComponent<
  CategoryPickerModalProps
> = ({ show, onClose, onChange: onChangeProps, transaction, ...props }) => {
  const [selectedCategories, setSelectedCategories] = useState(props.values);
  const [error, setError] = useState<string | null>(null);
  const changeProperty = useChangeArray<TransactionCategory>(
    setSelectedCategories,
  );

  if (!transaction) return null;

  const onChange = (category: CategoryBudget) => {
    const currIndex = selectedCategories.findIndex(
      (c) => c.category.id === category.id,
    );
    const newCategories = selectedCategories.slice();
    if (currIndex > -1) {
      newCategories.splice(currIndex, 1);
      setSelectedCategories(newCategories);
    } else {
      setSelectedCategories([
        ...selectedCategories,
        {
          id: "",
          category,
          amount: remainingAmount,
          transactionId: transaction.transactionId,
        },
      ]);
    }
  };

  const onSave = (): void => {
    if (remainingAmount !== 0) {
      setError("Amounts do not add up to the transaction amount");
      return;
    }
    if (selectedCategories.some((selected) => selected.amount === 0)) {
      setError("Amounts must be greater than 0");
      return;
    }

    onChangeProps(selectedCategories);
    onClose();
  };

  const onRemove = (): void => {
    onChangeProps([]);
    onClose();
  };

  const remainingAmount = round(
    transaction.amount -
      selectedCategories.reduce((prev, curr) => prev + curr.amount, 0),
    2,
  );

  return (
    <Dialog open={show} onClose={onClose}>
      <CategoryPicker
        {...props}
        values={selectedCategories}
        onChange={onChange}
      />
      <div className="flex flex-col gap-2">
        {selectedCategories.map((category, i) => (
          <Label key={category.id} label={category.category.name}>
            <InputBlur
              value={category.amount}
              onChange={(value) =>
                changeProperty(selectedCategories, i, "amount", Number(value))
              }
            />
          </Label>
        ))}
        <div>Remaining Balance: {formatDollarAmount(remainingAmount)}</div>
        {error ? <div className="text-sm text-red-400">{error}</div> : null}
      </div>
      <DialogActions>
        <Button onClick={onRemove} plain>
          Remove
        </Button>
        <Button onClick={onSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};
