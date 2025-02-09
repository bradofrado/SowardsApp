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
import { api } from "next-utils/src/utils/api";

interface CategoryFormProps {
  categories: CategoryBudget[];
}
export const CategoryForm: React.FunctionComponent<CategoryFormProps> = ({
  categories,
}) => {
  const [tempCategories, setTempCategories] =
    useState<CategoryBudget[]>(categories);
  const [loading, setLoading] = useState(false);
  const { mutate: saveCategories } = api.budget.createCategories.useMutation();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    saveCategories(
      { categories: tempCategories },
      {
        onSuccess: () => setLoading(false),
        onError: () => setLoading(false),
      },
    );
  };

  const onChange = (categories: CategoryBudget[]) => {
    setTempCategories(
      categories.map((category, i) => ({ ...category, order: i })),
    );
  };

  return (
    <Form onSubmit={onSubmit}>
      <Heading>Categories</Heading>
      <FormDivider />

      <FormAddRemove
        label="Categories"
        description="Select the categories you want to budget."
        items={tempCategories}
        onChange={onChange}
        dropdownItemsMap={(category) => ({
          id: category.id,
          name: category.name,
        })}
        getDefaultItem={(categories) =>
          ({
            id: `cat-${categories.length}`,
            name: "New Category",
            type: "expense",
          }) as CategoryBudget
        }
        componentLineItem={CategoryItem}
        reorder
      />

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
