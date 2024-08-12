"use client";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { UserVacation } from "model/src/vacation";
import { usePathname } from "next/navigation";
import {
  ApplicationLayout as Layout,
  SidebarItem,
} from "ui/src/components/feature/application-layout";
import { HomeIcon } from "ui/src/components/core/icons";

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
