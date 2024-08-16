"use client";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { UserVacation } from "model/src/vacation";
import { usePathname } from "next/navigation";
import {
  ApplicationLayout as Layout,
  SidebarItem,
} from "ui/src/components/feature/application-layout";
import {
  Cog6ToochIcon,
  EditSquareIcon,
  HomeIcon,
  MoneyIcon,
  Square2StackIcon,
} from "ui/src/components/core/icons";

export const ApplicationLayout: React.FunctionComponent<{
  children: React.ReactNode;
}> = ({ children }) => {
  const pathname = usePathname();
  const items: SidebarItem[] = [
    {
      href: "/",
      label: "Home",
      icon: <HomeIcon />,
    },
    {
      href: "/spending",
      label: "Spending",
      icon: <MoneyIcon />,
    },
    {
      href: "/plan",
      label: "Plan",
      icon: <Square2StackIcon />,
    },
    {
      href: "/settings",
      label: "Settings",
      icon: <Cog6ToochIcon />,
    },
  ];
  return (
    <Layout
      pathname={pathname}
      items={items}
      title="Sowards Budgets"
      profileItem={
        <>
          <UserButton />
        </>
      }
    >
      {children}
    </Layout>
  );
};
