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
import type { TRPCContext } from "api/src/trpc";

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

// export const isNotRole =
//   <T>(desiredRole: UserRole, transform?: (obj: T) => UserRole) =>
//   (obj: T | UserRole) => {
//     const result = UserRoleSchema.safeParse(obj);
//     const role: UserRole | Error = result.success
//       ? result.data
//       : transform === undefined
//       ? Error("must provide transform method")
//       : transform(obj as T);
//     if (role instanceof Error) {
//       throw role;
//     }
//     return role !== desiredRole && role !== "admin";
//   };

export const requireUserVacation = requireRoute({
  redirect: "/settings",
  check: (session) => Boolean(session && !session.auth.userVacation),
});

export const requireAuth = requireRoute({
  redirect: "/settings",
  check: (session) => {
    return session?.auth === undefined;
  },
});

export interface AuthProps {
  ctx: TRPCContext;
}
interface PageProps {
  params: Record<string, string>;
  searchParams: { [key: string]: string | string[] | undefined };
}
export const withAuth =
  (
    Component: React.FunctionComponent<AuthProps>,
  ): ((props: PageProps) => Promise<JSX.Element>) =>
  async () => {
    const cookie = cookies();
    const mockUserId = cookie.get("harmony-user-id");
    const response = await requireAuth()(mockUserId?.value);

    if (response.redirect) {
      redirect("/settings");
    }

    return <Component ctx={{ prisma, session: response.session! }} />;
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
