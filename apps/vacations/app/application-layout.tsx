"use client";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { UserVacation } from "model/src/vacation";
import { usePathname } from "next/navigation";
import { ApplicationLayout as Layout } from "ui/src/components/feature/application-layout";
import { useUser } from "./plan/components/user-provider";

export const ApplicationLayout: React.FunctionComponent<{
  children: React.ReactNode;
  users: UserVacation[];
}> = ({ children, users }) => {
  const { user, setUser, isAdmin } = useUser();
  const pathname = usePathname();
  return (
    <Layout
      currUser={user}
      users={users}
      onUserChange={setUser}
      pathname={pathname}
      isAdmin={isAdmin}
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
    >
      {children}
    </Layout>
  );
};
