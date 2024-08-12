"use client";

import { useState } from "react";
import {
  AddRemoveComponent,
  FormAddRemove,
} from "ui/src/components/catalyst/form/add-remove";
import {
  Form,
  FormDivider,
  FormRow,
} from "ui/src/components/catalyst/form/form";
import { Heading } from "ui/src/components/catalyst/heading";
import { Input } from "ui/src/components/core/input";
import { useChangeProperty } from "ui/src/hooks/change-property";
import { Button } from "ui/src/components/catalyst/button";
import { CategoryBudget } from "model/src/budget";
import { Dropdown, DropdownItem } from "ui/src/components/core/dropdown";

interface CategoryFormProps {
  categories: CategoryBudget[];
  saveCategories: (categories: CategoryBudget[]) => Promise<void>;
}
export const CategoryForm: React.FunctionComponent<CategoryFormProps> = ({
  categories,
  saveCategories,
}) => {
  const [tempCategories, setTempCategories] =
    useState<CategoryBudget[]>(categories);
  const [loading, setLoading] = useState(false);

  const onSubmit = () => {
    setLoading(true);
    saveCategories(tempCategories)
      .then(() => setLoading(false))
      .catch(() => setLoading(false));
  };

  return (
    <Form onSubmit={onSubmit}>
      <Heading>Categories</Heading>
      <FormDivider />

      <FormAddRemove
        label="Categories"
        description="Select the categories you want to budget."
        items={tempCategories}
        onChange={setTempCategories}
        dropdownItemsMap={(category) => ({
          id: category.id,
          name: category.name,
        })}
        getDefaultItem={(categories) =>
          ({
            id: `cat-${categories.length}`,
            name: "New Category",
            type: "income",
          }) as CategoryBudget
        }
        componentLineItem={CategoryItem}
      ></FormAddRemove>

      <div className="flex justify-end gap-4 mt-4">
        <Button
          onClick={() => setTempCategories(categories)}
          plain
          type="reset"
        >
          Reset
        </Button>
        <Button loading={loading} type="submit">
          Save changes
        </Button>
      </div>
    </Form>
  );
};

const CategoryItem: AddRemoveComponent<CategoryBudget> = ({
  value,
  onChange,
}) => {
  const changeProperty = useChangeProperty(onChange);
  const categoryTypeItems: DropdownItem<CategoryBudget["type"]>[] = [
    {
      id: "income",
      name: "Income",
    },
    {
      id: "expense",
      name: "Expense",
    },
  ];

  return (
    <>
      <FormRow description="This is the name of the category." label="Name">
        <Input
          className="w-full"
          onChange={changeProperty.formFunc("name", value)}
          value={value.name}
        />
      </FormRow>
      <FormDivider />
      <FormRow description="Income or Expense" label="Type">
        <Dropdown
          initialValue={value.type}
          items={categoryTypeItems}
          onChange={(item) => changeProperty(value, "type", item.id)}
        />
      </FormRow>
    </>
  );
};
