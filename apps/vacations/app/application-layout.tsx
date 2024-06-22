"use client";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { ApplicationLayout as Layout } from "ui/src/components/feature/application-layout";

export const ApplicationLayout: React.FunctionComponent<{
  children: React.ReactNode;
}> = ({ children }) => {
  const pathname = usePathname();
  return (
    <Layout
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
    >
      {children}
    </Layout>
  );
};
