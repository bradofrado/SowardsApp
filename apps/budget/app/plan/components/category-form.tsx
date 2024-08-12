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
import { BudgetCategory } from "../../../../../packages/db/lib/generated/client";
import { Input } from "ui/src/components/core/input";
import { useChangeProperty } from "ui/src/hooks/change-property";

export const CategoryForm: React.FunctionComponent = () => {
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  return (
    <Form>
      <Heading>Categories</Heading>
      <FormDivider />

      <FormAddRemove
        label="Categories"
        description="Select the categories you want to budget."
        items={categories}
        onChange={setCategories}
        dropdownItemsMap={(category) => ({
          id: category.id,
          name: category.name,
        })}
        getDefaultItem={(categories) => ({
          id: `cat-${categories.length}`,
          name: "New Category",
        })}
        componentLineItem={CategoryItem}
      ></FormAddRemove>
    </Form>
  );
};

const CategoryItem: AddRemoveComponent<BudgetCategory> = ({
  value,
  onChange,
}) => {
  const changeProperty = useChangeProperty(onChange);
  return (
    <FormRow
      description="This is the name of the category."
      label="Category Name"
    >
      <Input
        className="w-full"
        onChange={changeProperty.formFunc("name", value)}
        value={value.name}
      />
    </FormRow>
  );
};
