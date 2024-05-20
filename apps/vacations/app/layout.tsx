import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { TrpcProvider } from "../utils/trpc-provider";
import {Navbar} from 'ui/src/components/core/navbar';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Turborepo",
  description: "Generated by create turbo",
};

function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <TrpcProvider>
      <html className="h-full bg-white" lang="en">
        <body className={`${inter.className} h-full`}>
          <Navbar/>
          {children}
        </body>
      </html>
    </TrpcProvider>
  );
}

export default RootLayout;