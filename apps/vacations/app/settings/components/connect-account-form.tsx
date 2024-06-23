/* eslint-disable @typescript-eslint/no-non-null-assertion -- ok*/
/* eslint-disable @typescript-eslint/no-confusing-void-expression -- ok*/
"use client";
import type {
  AmountType,
  UserVacation,
  VacationDependent,
} from "model/src/vacation";
import { useMemo, useState } from "react";
import type { DropdownItem } from "ui/src/components/core/dropdown";
import { Button } from "ui/src/components/catalyst/button";
import { Divider } from "ui/src/components/catalyst/divider";
import { Heading, Subheading } from "ui/src/components/catalyst/heading";
import { Input } from "ui/src/components/core/input";
import { Text } from "ui/src/components/catalyst/text";
import { Dropdown } from "ui/src/components/core/dropdown";
import { useChangeProperty } from "ui/src/hooks/change-property";
import { CalendarColorType } from "model/src/calendar";

interface ConnectAccountFormProps {
  users: UserVacation[];
  onUpdate: (user: UserVacation) => Promise<void>;
  user: UserVacation;
}
export const ConnectAccountForm: React.FunctionComponent<
  ConnectAccountFormProps
> = ({ users, onUpdate, user: origUser }) => {
  const [selectedUser, setSelectedUser] = useState<UserVacation>(origUser);
  const [userItems, setUserItems] = useState<UserVacation[]>(users);
  const changeProperty = useChangeProperty<UserVacation>(setSelectedUser);
  const [loading, setLoading] = useState(false);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    setLoading(true);
    event.preventDefault();
    onUpdate(selectedUser)
      .then(() => setLoading(false))
      .catch(() => setLoading(false));
  };

  return (
    <form method="post" className="mx-auto max-w-4xl" onSubmit={onSubmit}>
      <Heading>Settings</Heading>
      <Divider className="my-10 mt-6" />

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Connect to Family</Subheading>
          <Text>Select the family this account is apart of or new family.</Text>
        </div>
        <div className="flex gap-4 items-center justify-between">
          <Dropdown
            items={userItems}
            initialValue={selectedUser.id}
            onChange={(item) => setSelectedUser(item as UserVacation)}
          />
          <Button
            type="button"
            onClick={() => {
              const newUser: UserVacation = {
                id: "",
                name: "New Family",
                color: "blue",
                createdByEvents: [],
                dependents: [
                  {
                    id: "0",
                    firstname: "New",
                    lastname: "Dependent",
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
          >
            New
          </Button>
        </div>
      </section>

      <Divider className="my-10" soft />

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Family Name</Subheading>
          <Text>This is the name of your family.</Text>
        </div>
        <div>
          <Input
            className="w-full"
            value={selectedUser.name}
            onChange={changeProperty.formFunc("name", selectedUser)}
          />
        </div>
      </section>

      <Divider className="my-10" soft />

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Color</Subheading>
          <Text>
            This is the color that your family&#39;s events will show up as.
          </Text>
        </div>
        <div>
          <Dropdown
            items={
              [
                { id: "red", name: "Red" },
                { id: "green", name: "Green" },
                { id: "blue", name: "Blue" },
                { id: "yellow", name: "Yellow" },
                { id: "violet", name: "Violet" },
              ] as DropdownItem<CalendarColorType>[]
            }
            initialValue={selectedUser.color}
            onChange={(item) => changeProperty(selectedUser, "color", item.id)}
          />
        </div>
      </section>

      <Divider className="my-10" soft />

      <Heading>Members</Heading>

      <Divider className="my-10" soft />

      <DependentsForm
        dependents={selectedUser.dependents}
        onChange={changeProperty.formFunc("dependents", selectedUser)}
      />

      <div className="flex justify-end gap-4 mt-4">
        <Button type="reset" plain onClick={() => setSelectedUser(origUser)}>
          Reset
        </Button>
        <Button type="submit" loading={loading}>
          Save changes
        </Button>
      </div>
    </form>
  );
};

const DependentsForm: React.FunctionComponent<{
  dependents: VacationDependent[];
  onChange: (values: VacationDependent[]) => void;
}> = ({ dependents, onChange }) => {
  const [selectedDependent, setSelectedDependent] = useState<number>(0);
  const dependent: VacationDependent | undefined = useMemo(
    () => dependents[selectedDependent] as VacationDependent | undefined,
    [dependents, selectedDependent],
  );

  const onDependentChange = (value: VacationDependent, index: number): void => {
    const copy = dependents.slice();
    copy[index] = value;
    onChange(copy);
  };

  const onAddDependent = (): void => {
    const copy = dependents.slice();
    copy.push({
      id: String(selectedDependent),
      firstname: "New",
      lastname: "Dependent",
      amountType: "adult",
    });
    onChange(copy);
    setSelectedDependent(copy.length - 1);
  };

  const onRemoveDependent = (index: number): void => {
    const copy = dependents.slice();
    copy.splice(index, 1);
    onChange(copy);
    setSelectedDependent(0);
  };

  return (
    <div>
      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Dependent</Subheading>
          <Text>Select the dependent to edit.</Text>
        </div>
        <div className="flex gap-4 items-center justify-between">
          <Dropdown
            className="w-full"
            items={dependents.map((d) => ({
              id: d.id,
              name: `${d.firstname} ${d.lastname}`,
            }))}
            initialValue={dependent?.id}
            onChange={(item) =>
              setSelectedDependent(
                dependents.findIndex((d) => d.id === item.id),
              )
            }
          ></Dropdown>
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              plain
              onClick={() => onRemoveDependent(selectedDependent)}
            >
              Remove
            </Button>
            <Button type="button" onClick={onAddDependent}>
              New
            </Button>
          </div>
        </div>
      </section>

      <Divider className="my-10" soft />

      {dependent ? (
        <DependentItem
          onChange={(value) => {
            onDependentChange(value, selectedDependent);
          }}
          value={dependent}
        />
      ) : null}
    </div>
  );
};

const DependentItem: React.FunctionComponent<{
  value: VacationDependent;
  onChange: (value: VacationDependent) => void;
}> = ({ value, onChange }) => {
  const changeProperty = useChangeProperty(onChange);
  return (
    <div>
      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Name</Subheading>
          <Text>This is the name of the dependent.</Text>
        </div>
        <div className="flex gap-4 items-center">
          <Input
            className="w-full"
            value={value.firstname}
            onChange={changeProperty.formFunc("firstname", value)}
          />
          <Input
            className="w-full"
            value={value.lastname}
            onChange={changeProperty.formFunc("lastname", value)}
          />
        </div>
      </section>

      <Divider className="my-10" soft />

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Amount Type</Subheading>
          <Text>This is the type of dependent relating to budget amounts.</Text>
        </div>
        <div>
          <AmountTypeDropdown
            onChange={changeProperty.formFunc("amountType", value)}
            value={value.amountType}
          />
        </div>
      </section>
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
