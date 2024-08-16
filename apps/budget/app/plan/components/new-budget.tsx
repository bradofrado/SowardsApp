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
import {
  Form,
  FormDivider,
  FormRow,
} from "ui/src/components/catalyst/form/form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "ui/src/components/core/accordion";
import { Dropdown } from "ui/src/components/core/dropdown";
import { CalendarIcon } from "ui/src/components/core/icons";
import { Input, InputBlur } from "ui/src/components/core/input";
import { Label } from "ui/src/components/core/label";
import { useChangeProperty } from "ui/src/hooks/change-property";

export const NewBudgetButton: React.FunctionComponent<{
  className?: string;
  categories: CategoryBudget[];
}> = ({ className, categories }) => {
  const { mutate: createBudget } = api.budget.createBudget.useMutation();
  const [show, setShow] = useState(false);

  const onCreate = (budget: Budget) => {
    createBudget(
      { budget },
      {
        onSuccess() {
          setShow(false);
        },
      },
    );
  };

  return (
    <>
      <Button className={className} onClick={() => setShow(true)}>
        New Budget
      </Button>
      <NewBudgetModal
        show={show}
        onClose={() => setShow(false)}
        categories={categories}
        onCreate={onCreate}
      />
    </>
  );
};

interface NewBudgetModalProps {
  show: boolean;
  onClose: () => void;
  categories: CategoryBudget[];
  onCreate: (budget: Budget) => void;
}
export const NewBudgetModal: React.FunctionComponent<NewBudgetModalProps> = ({
  show,
  onClose,
  categories,
  onCreate,
}) => {
  const [budget, setBudget] = useState<Budget>({
    id: "",
    name: "New Budget",
    items: [],
  });
  const changeProperty = useChangeProperty<Budget>(setBudget);

  const onAddItem = (item: BudgetItem) => {
    changeProperty(budget, "items", [...budget.items, item]);
  };

  const onRemoveItem = (item: BudgetItem) => {
    changeProperty(
      budget,
      "items",
      budget.items.filter((i) => i.id !== item.id),
    );
  };

  const onChangeItem = (item: BudgetItem) => {
    changeProperty(
      budget,
      "items",
      budget.items.map((i) => (i.id === item.id ? item : i)),
    );
  };

  return (
    <Dialog open={show} onClose={onClose}>
      <DialogTitle>Create Budget</DialogTitle>
      <DialogDescription>
        Create a new budget template to plan for your future!
      </DialogDescription>
      <DialogBody>
        <Form>
          <FormRow label="Budget Name" description="The name of your budget">
            <Input
              value={budget.name}
              onChange={changeProperty.formFunc("name", budget)}
            />
          </FormRow>
          <FormDivider />
          <FormRow
            label="Categories"
            description="Select the categories that will be in this budget. Also include the amount and cadence for each category."
            sameLine
          >
            <div className="w-full max-w-md mx-auto">
              <Accordion type="single" collapsible>
                {budget.items.map((item) => (
                  <BudgetItemAccordion
                    key={item.id}
                    item={item}
                    categories={categories}
                    onChange={onChangeItem}
                    onRemove={onRemoveItem}
                  />
                ))}
              </Accordion>
            </div>
            <BudgetItemForm
              key={budget.items.length}
              item={{
                id: `cat-${budget.items.length + 1}`,
                category: categories[0],
                startDate: new Date(),
                endDate: new Date(),
                amount: 100,
              }}
              categories={categories}
              onChange={onChangeItem}
              onAdd={onAddItem}
            />
          </FormRow>
        </Form>
      </DialogBody>
      <DialogActions>
        <Button onClick={onClose} plain>
          Cancel
        </Button>
        <Button onClick={() => onCreate(budget)}>Create</Button>
      </DialogActions>
    </Dialog>
  );
};

const BudgetItemForm: React.FunctionComponent<BudgetItemProps> = ({
  item: itemProps,
  onChange,
  categories,
  onAdd,
  onRemove,
}) => {
  const [itemState, setItemState] = useState(itemProps);
  const changeProperty = useChangeProperty<BudgetItem>(
    onAdd ? setItemState : onChange,
  );
  const item = onAdd ? itemState : itemProps;

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label label="Name">
            <Dropdown
              items={categories}
              initialValue={item.category.id}
              onChange={(category) =>
                changeProperty(item, "category", category as CategoryBudget)
              }
            />
          </Label>
        </div>
        <div className="space-y-1">
          <Label label="Repeat">
            <Dropdown
              initialValue="monthly"
              items={[
                { id: "monthly", name: "Monthly" },
                { id: "quarterly", name: "Quarterly" },
                { id: "yearly", name: "Yearly" },
                { id: "variable", name: "Variable" },
              ]}
            />
          </Label>
        </div>
      </div>
      <div className="space-y-1">
        <Label label="Amount">
          <InputBlur
            value={item.amount}
            onChange={changeProperty.formFuncNumber("amount", item)}
          />
        </Label>
      </div>
      {onRemove ? (
        <Button plain className="w-full" onClick={() => onRemove(item)}>
          Remove
        </Button>
      ) : null}
      {onAdd ? (
        <Button className="w-full" onClick={() => onAdd(item)}>
          Add
        </Button>
      ) : null}
    </div>
  );
};

interface BudgetItemProps {
  item: BudgetItem;
  categories: CategoryBudget[];
  onChange: (item: BudgetItem) => void;
  onAdd?: (item: BudgetItem) => void;
  onRemove?: (item: BudgetItem) => void;
}
const BudgetItemAccordion: React.FunctionComponent<BudgetItemProps> = (
  props,
) => {
  return (
    <AccordionItem value={`item-${props.item.id}`}>
      <AccordionTrigger className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          <span>{props.item.category.name}</span>
        </div>

        <span>${props.item.amount.toFixed(2)}</span>
      </AccordionTrigger>
      <AccordionContent>
        <BudgetItemForm {...props} />
      </AccordionContent>
    </AccordionItem>
  );
};
