import "./globals.css";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ApplicationLayout } from "./application-layout";
import { getUserVactions } from "api/src/repositories/user-vacation";
import { TrpcProvider } from "next-utils/src/utils/trpc-provider";

export const metadata: Metadata = {
  title: "Sowards Bugdets",
  description: "Make budgeting easy",
};

async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<JSX.Element> {
  return (
    <ClerkProvider>
      <TrpcProvider>
        <html
          lang="en"
          className="text-zinc-950 antialiased lg:bg-zinc-100 dark:bg-zinc-900 dark:text-white dark:lg:bg-zinc-950"
        >
          <head>
            <link rel="preconnect" href="https://rsms.me/" />
            <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
          </head>
          <body>
            <ApplicationLayout>{children}</ApplicationLayout>
          </body>
        </html>
      </TrpcProvider>
    </ClerkProvider>
  );
}

export default RootLayout;
