"use client";

import {
  DashboardIcon,
  UsersIcon,
  FolderIcon,
  CalendarIcon,
  DocumentDuplicateIcon,
  ChartPieIcon,
} from "ui/src/components/core/icons";
import type { ProfileItem } from "ui/src/components/core/side-panel";
import { SidePanel } from "ui/src/components/core/side-panel";

const navigation = [
  { label: "Dashboard", href: "#", icon: DashboardIcon, current: true },
  { label: "Team", href: "#", icon: UsersIcon, current: false },
  { label: "Projects", href: "#", icon: FolderIcon, current: false },
  { label: "Calendar", href: "#", icon: CalendarIcon, current: false },
  {
    label: "Documents",
    href: "#",
    icon: DocumentDuplicateIcon,
    current: false,
  },
  { label: "Reports", href: "#", icon: ChartPieIcon, current: false },
];

// const teams = [
//   { id: 1, name: 'Heroicons', href: '#', initial: 'H', current: false },
//   { id: 2, name: 'Tailwind Labs', href: '#', initial: 'T', current: false },
//   { id: 3, name: 'Workcation', href: '#', initial: 'W', current: false },
// ]

export const SideNav: React.FunctionComponent = () => {
  const profileItem: ProfileItem = {
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    name: "Tom Cook",
    href: "/profile",
  };
  return (
    <SidePanel items={navigation} profileItem={profileItem} title="Nexa" />
  );
};
