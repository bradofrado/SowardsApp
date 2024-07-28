import "./globals.css";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { TrpcProvider } from "../utils/trpc-provider";
import { ApplicationLayout } from "./application-layout";
import { UserProvider } from "./plan/components/user-provider";
import { requireUserVacation } from "../utils/protected-routes-hoc";
import { getUser } from "./plan/actions";
import { getUserVactions } from "api/src/repositories/user-vacation";
import { TimezoneProvider } from "ui/src/components/core/calendar/timezone";

export const metadata: Metadata = {
  title: "Create Turborepo",
  description: "Generated by create turbo",
};

async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<JSX.Element> {
  const result = await requireUserVacation()();
  const users = await getUserVactions();
  return (
    <ClerkProvider>
      <TrpcProvider>
        <UserProvider
          getUser={getUser}
          user={result.session?.auth.userVacation}
          isAdmin={result.session?.auth.user.roles.includes("admin") || false}
        >
          <TimezoneProvider initialTimezone="Pacific/Honolulu">
            <html
              lang="en"
              className="text-zinc-950 antialiased lg:bg-zinc-100 dark:bg-zinc-900 dark:text-white dark:lg:bg-zinc-950"
            >
              <head>
                <link rel="preconnect" href="https://rsms.me/" />
                <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
              </head>
              <body>
                <ApplicationLayout users={users}>{children}</ApplicationLayout>
              </body>
            </html>
          </TimezoneProvider>
        </UserProvider>
      </TrpcProvider>
    </ClerkProvider>
  );
}

export default RootLayout;
