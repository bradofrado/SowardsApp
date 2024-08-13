/* eslint-disable @typescript-eslint/no-confusing-void-expression -- ok*/
"use client";
import type {
  AmountType,
  UserVacation,
  VacationDependent,
} from "model/src/vacation";
import { useState } from "react";
import type { User } from "model/src/auth";
import type { DropdownItem } from "../../core/dropdown";
import { Button } from "../../catalyst/button";
import { Heading } from "../../catalyst/heading";
import { Input } from "../../core/input";
import { Dropdown } from "../../core/dropdown";
import { useChangeProperty } from "../../../hooks/change-property";
import { Form, FormDivider, FormRow } from "../../catalyst/form/form";
import { FormAddRemove } from "../../catalyst/form/add-remove";

interface ConnectAccountFormProps {
  users: UserVacation[];
  onUpdate: (user: UserVacation) => Promise<void>;
  userVacation: UserVacation | undefined;
  user: User | undefined | null;
}
export const ConnectAccountForm: React.FunctionComponent<
  ConnectAccountFormProps
> = ({ users, onUpdate, userVacation: origUser, user }) => {
  const [selectedUser, setSelectedUser] = useState<UserVacation | undefined>(
    origUser,
  );
  const [userItems, setUserItems] = useState<UserVacation[]>(users);
  const changeProperty = useChangeProperty<UserVacation>(setSelectedUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    if (!selectedUser) {
      setError("Please select a family.");
      return;
    }

    setLoading(true);
    event.preventDefault();
    selectedUser.dependents.forEach((dependent) => {
      if (dependent.id.startsWith("test-")) {
        dependent.id = "";
      }
    });
    onUpdate(selectedUser)
      .then(() => setLoading(false))
      .catch(() => setLoading(false));
  };

  return (
    <Form onSubmit={onSubmit}>
      <Heading>Settings</Heading>
      <FormDivider />

      <FormRow
        description="Select the family this account is apart of or new family."
        label="Connect to Family"
      >
        <div className="flex gap-4 items-center justify-between">
          {userItems.length > 0 ? (
            <Dropdown
              initialValue={selectedUser?.id}
              items={userItems}
              onChange={(item) => setSelectedUser(item as UserVacation)}
            >
              Select Family
            </Dropdown>
          ) : null}
          <Button
            onClick={() => {
              const newUser: UserVacation = {
                id: "",
                name: "New Family",
                createdByEvents: [],
                dependents: [
                  {
                    id: "0",
                    firstname: user?.firstname || "New",
                    lastname: user?.lastname || "Dependent",
                    amountType: "adult",
                  },
                ],
                eventIds: [],
                events: [],
                groupIds: [],
                groups: [],
              };
              setSelectedUser(newUser);
              const copy = userItems.slice();
              copy.push(newUser);
              setUserItems(copy);
            }}
            type="button"
          >
            New
          </Button>
        </div>
      </FormRow>

      {userItems.length > 0 && selectedUser ? (
        <>
          <FormDivider />

          <FormRow
            description="This is the name of your family."
            label="Family Name"
          >
            <div>
              <Input
                className="w-full"
                onChange={changeProperty.formFunc("name", selectedUser)}
                value={selectedUser.name}
              />
            </div>
          </FormRow>

          <FormDivider />

          <Heading>Members</Heading>

          <FormDivider />

          <DependentsForm
            dependents={selectedUser.dependents}
            onChange={changeProperty.formFunc("dependents", selectedUser)}
          />

          {error ? <p className="text-red-500">{error}</p> : null}

          <div className="flex justify-end gap-4 mt-4">
            <Button
              onClick={() => setSelectedUser(origUser)}
              plain
              type="reset"
            >
              Reset
            </Button>
            <Button loading={loading} type="submit">
              Save changes
            </Button>
          </div>
        </>
      ) : null}
    </Form>
  );
};

const DependentsForm: React.FunctionComponent<{
  dependents: VacationDependent[];
  onChange: (values: VacationDependent[]) => void;
}> = ({ dependents, onChange }) => {
  return (
    <FormAddRemove
      componentLineItem={DependentItem}
      description="Select the dependent to edit."
      dropdownItemsMap={(d) => ({
        id: d.id,
        name: `${d.firstname} ${d.lastname}`,
      })}
      getDefaultItem={(items) =>
        ({
          id: `test-${String(items.length)}`,
          firstname: "New",
          lastname: "Dependent",
          amountType: "adult",
        }) as VacationDependent
      }
      items={dependents}
      label="Dependent"
      onChange={onChange}
    />
  );
};

const DependentItem: React.FunctionComponent<{
  value: VacationDependent;
  onChange: (value: VacationDependent) => void;
}> = ({ value, onChange }) => {
  const changeProperty = useChangeProperty(onChange);
  return (
    <div>
      <FormRow
        description="This is the name of the dependent."
        label="Dependent Name"
      >
        <div className="flex gap-4 items-center">
          <Input
            className="w-full"
            onChange={changeProperty.formFunc("firstname", value)}
            value={value.firstname}
          />
          <Input
            className="w-full"
            onChange={changeProperty.formFunc("lastname", value)}
            value={value.lastname}
          />
        </div>
      </FormRow>

      <FormDivider />

      <FormRow
        description="This is the type of dependent relating to budget amounts."
        label="Amount Type"
      >
        <div>
          <AmountTypeDropdown
            onChange={changeProperty.formFunc("amountType", value)}
            value={value.amountType}
          />
        </div>
      </FormRow>
    </div>
  );
};

const AmountTypeDropdown: React.FunctionComponent<{
  value: AmountType;
  onChange: (value: AmountType) => void;
}> = ({ value, onChange }) => {
  const items: DropdownItem<AmountType>[] = [
    { id: "adult", name: "Adult" },
    { id: "child", name: "Child" },
  ];

  return (
    <Dropdown
      className="w-full"
      initialValue={value}
      items={items}
      onChange={(item) => {
        onChange(item.id);
      }}
    />
  );
};
