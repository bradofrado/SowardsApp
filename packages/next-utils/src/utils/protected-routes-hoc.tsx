/* eslint-disable @typescript-eslint/no-shadow -- ok*/
/* eslint-disable @typescript-eslint/consistent-indexed-object-style -- ok*/
/* eslint-disable @typescript-eslint/no-non-null-assertion -- ok*/
import { type GetServerSideProps } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import type { AuthedSession, Session } from "model/src/auth";
import { getServerAuthSession } from "api/src/auth";
import { prisma } from "db/lib/prisma";
import type { TRPCContextAuth, TRPCContextSession } from "api/src/trpc";

interface RequireRouteProps {
  redirect: string;
  check?: (session: Session | undefined) => boolean;
}
export const requireRoute =
  ({ redirect, check }: RequireRouteProps) =>
  () =>
  async (mockUserId?: string) => {
    const { userId } = auth();
    const session = await getServerAuthSession(userId, mockUserId);

    if (check && check(session)) {
      return { redirect, session: undefined };
    }

    return { session: session as AuthedSession, redirect: undefined };
  };

export const requireAuth = requireRoute({
  redirect: "/setup",
  check: (session) => {
    return (
      session?.auth === undefined || session?.auth.userVacation === undefined
    );
  },
});

export const requireSession = requireRoute({
  redirect: "/setup",
  check: (session) => {
    return session?.auth === undefined;
  },
});

export interface AuthProps {
  ctx: TRPCContextAuth;
}
interface PageProps {
  params: Record<string, string>;
  searchParams: { [key: string]: string | string[] | undefined };
}
export const withAuth =
  (
    Component: (props: AuthProps) => Promise<JSX.Element> | JSX.Element,
  ): ((props: PageProps) => Promise<JSX.Element | null>) =>
  async () => {
    const cookie = cookies();
    const mockUserId = cookie.get("harmony-user-id");
    const response = await requireAuth()(mockUserId?.value);

    if (response.redirect) {
      redirect("/setup");
    }

    return Component({ ctx: { prisma, session: response.session! } });
  };

export interface SessionProps {
  ctx: TRPCContextSession;
}
export const withSession =
  (
    Component: (props: SessionProps) => Promise<JSX.Element> | JSX.Element,
  ): ((props: PageProps) => Promise<JSX.Element | null>) =>
  async () => {
    const cookie = cookies();
    const mockUserId = cookie.get("harmony-user-id");
    const response = await requireSession()(mockUserId?.value);

    if (response.redirect) {
      redirect("/setup");
    }

    return Component({ ctx: { prisma, session: response.session! } });
  };

// export const requireRole = (role: UserRole) =>
//   requireRoute({
//     redirect: "/",
//     check: isNotRole(role, (session) => session.user.role),
//   });

export const defaultGetServerProps: GetServerSideProps = () =>
  new Promise((resolve) => {
    resolve({ props: {} });
  });
