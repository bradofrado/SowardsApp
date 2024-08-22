import "./globals.css";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ApplicationLayout } from "./(dashboard)/application-layout";
import { getUserVactions } from "api/src/repositories/user-vacation";
import { TrpcProvider } from "next-utils/src/utils/trpc-provider";
import { QueryStateProvider } from "ui/src/hooks/query-state";

export const metadata: Metadata = {
  title: "plinq",
  description: "Smart Budgeting Simplified",
};

async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<JSX.Element> {
  return (
    <ClerkProvider>
      <TrpcProvider>
        <QueryStateProvider>
          <html
            lang="en"
            className="text-zinc-950 antialiased lg:bg-zinc-100 dark:bg-zinc-900 dark:text-white dark:lg:bg-zinc-950"
          >
            <head>
              <link rel="preconnect" href="https://rsms.me/" />
              <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
            </head>
            <body>{children}</body>
          </html>
        </QueryStateProvider>
      </TrpcProvider>
    </ClerkProvider>
  );
}

export default RootLayout;
