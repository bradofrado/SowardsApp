import {
  Budget,
  BudgetCadence,
  BudgetItem,
  CategoryBudget,
  type EventuallyCadence,
  type MonthlyCadence,
  type WeeklyCadence,
  type YearlyCadence,
} from "model/src/budget";
import { Replace } from "model/src/core/utils";
import { api } from "next-utils/src/utils/api";
import { useEffect, useMemo, useState } from "react";
import { Button } from "ui/src/components/catalyst/button";
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogTitle,
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
import { DatePicker } from "ui/src/components/core/calendar/date-picker";
import { Dropdown, DropdownItem } from "ui/src/components/core/dropdown";
import { CalendarIcon } from "ui/src/components/core/icons";
import { Input, InputBlur } from "ui/src/components/core/input";
import { Label } from "ui/src/components/core/label";
import { useChangeProperty } from "ui/src/hooks/change-property";
import { usePrevious } from "ui/src/hooks/previous";

interface BudgetFormProps {
  budget: Budget;
  onChange: (budget: Budget) => void;
  categories: CategoryBudget[];
}
export const BudgetForm: React.FunctionComponent<BudgetFormProps> = ({
  budget,
  onChange,
  categories: categoriesProps,
}) => {
  const changeProperty = useChangeProperty(onChange);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [categories, setCategories] = useState(categoriesProps);

  const prevCategories = usePrevious(categoriesProps);

  useEffect(() => {
    if (prevCategories !== categoriesProps) {
      setCategories(categoriesProps);
    }
  }, [categoriesProps, prevCategories]);

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
    const index = budget.items.findIndex((i) => i.id === item.id);
    if (index === -1) {
      onAddItem(item);
    } else {
      changeProperty(
        budget,
        "items",
        budget.items.map((i) => (i.id === item.id ? item : i)),
      );
    }
  };

  const onCreateCategory = (category: CategoryBudget): void => {
    categories.push(category);
    setShowCreateCategory(false);
  };

  return (
    <>
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
            <Button onClick={() => setShowCreateCategory(true)}>
              Create Category
            </Button>
            <Accordion type="single" collapsible>
              {categories.map((category) => (
                <BudgetItemAccordion
                  key={category.id}
                  item={
                    budget.items.find(
                      (item) => item.category.id === category.id,
                    ) ?? {
                      id: `cat-${category.id}`,
                      category,
                      cadence: { type: "monthly", dayOfMonth: 1 },
                      amount: 0,
                    }
                  }
                  categories={categories}
                  onChange={onChangeItem}
                  onRemove={onRemoveItem}
                />
              ))}
            </Accordion>
          </div>
        </FormRow>
      </Form>
      <CreateCategoryModal
        show={showCreateCategory}
        onClose={() => setShowCreateCategory(false)}
        onCreate={onCreateCategory}
      />
    </>
  );
};

const BudgetItemForm: React.FunctionComponent<
  Replace<
    BudgetItemProps,
    "item",
    Replace<BudgetItem, "category", CategoryBudget | undefined>
  >
> = ({ item: itemProps, onChange, categories, onAdd, onRemove }) => {
  const [itemState, setItemState] = useState(itemProps);
  const [error, setError] = useState<string | undefined>(undefined);
  const [categoriesState, setCategoriesState] = useState(categories);

  const changeProperty = useChangeProperty<typeof itemProps>(
    onAdd ? setItemState : onChange,
  );
  const prevCategories = usePrevious(categories);

  useEffect(() => {
    if (prevCategories !== categories) {
      setCategoriesState(categories);
    }
  }, [categories, prevCategories]);

  const item = onAdd ? itemState : itemProps;

  const onAddClick = (): void => {
    if (!item.category) {
      setError("Please select a category");
      return;
    }

    onAdd?.(item as BudgetItem);
  };

  const onRemoveClick = (): void => {
    if (!item.category) {
      setError("Please select a category");
      return;
    }

    onRemove?.(item as BudgetItem);
  };

  const createCadence = (type: BudgetCadence["type"]): BudgetCadence => {
    switch (type) {
      case "weekly":
        return { type, dayOfWeek: "sunday" };
      case "monthly":
        return { type, dayOfMonth: 1 };
      case "yearly":
        return { type, month: 1, dayOfMonth: 1 };
      case "eventually":
        return { type };
    }
  };

  return (
    <>
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4 items-center">
          <div className="space-y-1">
            <Label label="Existing Category">
              <Dropdown
                className="w-full"
                items={categoriesState}
                initialValue={item.category?.id}
                onChange={(category) =>
                  changeProperty(item, "category", category as CategoryBudget)
                }
              />
            </Label>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 items-center">
          <Label label="Repeat">
            <Dropdown<BudgetCadence["type"]>
              className="w-full"
              initialValue={item.cadence.type}
              items={[
                { id: "weekly", name: "Weekly" },
                { id: "monthly", name: "Monthly" },
                { id: "yearly", name: "Yearly" },
                { id: "eventually", name: "Variable" },
              ]}
              onChange={(value) =>
                changeProperty(item, "cadence", createCadence(value.id))
              }
            />
          </Label>
          <div>
            <CadenceComponent
              value={item.cadence}
              onChange={changeProperty.formFunc("cadence", item)}
            />
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
        {error ? <p className="text-red-400 text-sm">{error}</p> : null}
        {onRemove ? (
          <Button plain className="w-full" onClick={onRemoveClick}>
            Remove
          </Button>
        ) : null}
        {onAdd ? (
          <Button className="w-full" onClick={onAddClick}>
            Add
          </Button>
        ) : null}
      </div>
    </>
  );
};

const CadenceComponent: React.FunctionComponent<{
  value: BudgetCadence;
  onChange: (value: BudgetCadence) => void;
}> = ({ value, onChange }) => {
  const components: Record<
    BudgetCadence["type"],
    BudgetCadencyComponent<BudgetCadence>
  > = useMemo(
    () => ({
      weekly: WeeklyCadence,
      monthly: MonthlyCadence,
      yearly: YearlyCadence,
      eventually: EventuallyCadence,
    }),
    [],
  );
  const Component = useMemo(
    () => components[value.type],
    [value.type, components],
  );

  return <Component value={value} onChange={onChange} />;
};

type BudgetCadencyComponent<T extends BudgetCadence> = (props: {
  onChange: (cadence: T) => void;
  value: T;
}) => JSX.Element;
const WeeklyCadence: BudgetCadencyComponent<WeeklyCadence> = ({
  onChange,
  value,
}) => {
  const items: DropdownItem<
    | "sunday"
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
  >[] = [
    { id: "sunday", name: "Sunday" },
    { id: "monday", name: "Monday" },
    { id: "tuesday", name: "Tuesday" },
    { id: "wednesday", name: "Wednesday" },
    { id: "thursday", name: "Thursday" },
    { id: "friday", name: "Friday" },
    { id: "saturday", name: "Saturday" },
  ];

  return (
    <Label label="Day of Week">
      <Dropdown
        className="w-full"
        initialValue={value.dayOfWeek}
        items={items}
        onChange={(dayOfWeek) =>
          onChange({ type: "weekly", dayOfWeek: dayOfWeek.id })
        }
      />
    </Label>
  );
};

const YearlyCadence: BudgetCadencyComponent<YearlyCadence> = ({
  onChange,
  value,
}) => {
  return (
    <Label label="Month and Day">
      <DatePicker
        date={new Date(2024, value.month, value.dayOfMonth)}
        onChange={(date) =>
          onChange({
            type: "yearly",
            month: date?.getMonth() || 0,
            dayOfMonth: date?.getDate() || 0,
          })
        }
      />
    </Label>
  );
};

const MonthlyCadence: BudgetCadencyComponent<MonthlyCadence> = ({
  onChange,
  value,
}) => {
  return (
    <Label label="Day of Month">
      <InputBlur
        className="w-full"
        value={value.dayOfMonth}
        onChange={(dayOfMonth) =>
          onChange({ type: "monthly", dayOfMonth: Number(dayOfMonth) })
        }
      />
    </Label>
  );
};

const EventuallyCadence: BudgetCadencyComponent<EventuallyCadence> = ({
  onChange,
}) => {
  useEffect(() => {
    onChange({ type: "eventually" });
  }, []);

  return <></>;
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

const CreateCategoryModal: React.FunctionComponent<{
  show: boolean;
  onClose: () => void;
  onCreate: (category: CategoryBudget) => void;
}> = ({ show, onClose, onCreate }) => {
  const [name, setName] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [error, setError] = useState<string | undefined>(undefined);

  const { mutate: createCategory } = api.budget.createCategory.useMutation();

  const onCreateClick = (): void => {
    createCategory(
      { name, type },
      {
        onSuccess: (category) => {
          onCreate(category);
        },
        onError: () => {
          setError("There was an error creating the category");
        },
      },
    );
  };
  return (
    <Dialog open={show} onClose={onClose}>
      <DialogTitle>Create Category</DialogTitle>
      <DialogBody>
        <Form>
          <FormRow label="Category Name" description="The name of the category">
            <Input value={name} onChange={setName} />
          </FormRow>
          <FormDivider />
          <FormRow
            label="Category Type"
            description="The type either expense or income"
          >
            <Dropdown<"income" | "expense">
              initialValue={type}
              items={[
                { id: "income", name: "Income" },
                { id: "expense", name: "Expense" },
              ]}
              onChange={(type) => setType(type.id)}
            />
          </FormRow>
        </Form>
        {error ? <p className="text-red-400 text-sm">{error}</p> : null}
      </DialogBody>
      <DialogActions>
        <Button onClick={onClose} plain>
          Cancel
        </Button>
        <Button onClick={onCreateClick}>Create</Button>
      </DialogActions>
    </Dialog>
  );
};
