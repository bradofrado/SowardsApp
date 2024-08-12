"use client";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { UserVacation } from "model/src/vacation";
import { usePathname } from "next/navigation";
import {
  ApplicationLayout as Layout,
  SidebarItem,
} from "ui/src/components/feature/application-layout";
import { useUser } from "./plan/components/user-provider";
import {
  SidebarHeading,
  SidebarSection,
} from "ui/src/components/catalyst/sidebar";
import { Dropdown } from "ui/src/components/core/dropdown";
import {
  Cog6ToochIcon,
  HomeIcon,
  Square2StackIcon,
} from "ui/src/components/core/icons";

export const ApplicationLayout: React.FunctionComponent<{
  children: React.ReactNode;
  users: UserVacation[];
}> = ({ children, users }) => {
  const { user, setUser, isAdmin } = useUser();
  const pathname = usePathname();
  const items: SidebarItem[] = [
    {
      href: "/",
      label: "Home",
      icon: <HomeIcon />,
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
      title="Sowards Vacations"
      pathname={pathname}
      profileItem={
        <>
          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal" />
          </SignedOut>
        </>
      }
      items={items}
      sideBarContent={
        <>
          {isAdmin && user ? (
            <SidebarSection className="max-lg:hidden">
              <SidebarHeading>Select User</SidebarHeading>

              <Dropdown
                className="w-full"
                items={users}
                initialValue={user.id}
                onChange={(item) => {
                  setUser(item as UserVacation);
                }}
              />
            </SidebarSection>
          ) : null}
        </>
      }
    >
      {children}
    </Layout>
  );
};
