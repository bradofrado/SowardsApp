import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@clerk/nextjs/dist/types/server";
import { cookies } from "next/headers";
import { Toaster } from "sonner";
import Script from "next/script";
import { getAuthSession } from "next-utils/src/utils/auth";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, cookieStore] = await Promise.all([
    getAuthSession(),
    cookies(),
  ]);
  const isCollapsed = cookieStore.get("sidebar:state")?.value !== "true";

  return (
    <>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Toaster position="top-center" />
        <Script
          src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
          strategy="beforeInteractive"
        />
        <SidebarProvider defaultOpen={!isCollapsed}>
          {/* <AppSidebar user={session?.auth.userVacation} /> */}
          <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
      </ThemeProvider>
    </>
  );
}
