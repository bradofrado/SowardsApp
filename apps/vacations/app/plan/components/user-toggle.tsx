"use client";
import type { DropdownItem } from "ui/src/components/core/dropdown";
import { Dropdown } from "ui/src/components/core/dropdown";
import { useRouter } from "next/navigation";
import type { UserVacation } from "model/src/vacation";
import { useUser } from "./user-provider";

interface UserToggleProps {
  users: UserVacation[];
  getUser: (id: string) => Promise<UserVacation | undefined>;
}
export const UserToggle: React.FunctionComponent<UserToggleProps> = ({
  users,
  getUser,
}) => {
  const { setUser, userId } = useUser();
  const router = useRouter();

  const items: DropdownItem<string>[] = users.map((_user) => ({
    id: _user.id,
    name: _user.name,
  }));
  const onChange = (item: DropdownItem<string>): void => {
    void getUser(item.id).then((_user) => {
      setUser(_user);
    });
    router.push(`?userId=${item.id}`);
  };
  return <Dropdown initialValue={userId} items={items} onChange={onChange} />;
};
