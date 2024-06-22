"use client";
import { usePathname } from "next/navigation";
import { ApplicationLayout as Layout } from "ui/src/components/feature/application-layout";

export const ApplicationLayout: React.FunctionComponent<{
  children: React.ReactNode;
}> = ({ children }) => {
  const pathname = usePathname();
  return <Layout pathname={pathname}>{children}</Layout>;
};
