/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { initTRPC, TRPCError } from "@trpc/server";
import type { PrismaClient } from "db/lib/prisma";
import { prisma } from "db/lib/prisma";
import superjson from "superjson";
import { ZodError } from "zod";
import { auth } from "@clerk/nextjs";
import type { AuthedSession, Session } from "model/src/auth";
import { cookies } from "next/headers";
import { getServerAuthSession } from "./auth";
/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 */
interface CreateContextOptions {
  session: Session | undefined;
}

export interface TRPCContext extends CreateContextOptions {
  prisma: PrismaClient;
}
export type TRPCContextAuth = Omit<TRPCContext, "session"> & {
  session: AuthedSession;
};
export type TRPCContextSession = Omit<TRPCContext, "session"> & {
  session: Session;
};

/**
 * This helper generates the "internals" for a tRPC context. If you need to use it, you can export
 * it from here.
 *
 * Examples of things you may need it for:
 * - testing, so we don't have to mock Next.js' req/res
 * - tRPC's `createSSGHelpers`, where we don't have req/res
 *
 * @see https://create.t3.gg/en/usage/trpc#-serverapitrpcts
 */
const createInnerTRPCContext = (opts: CreateContextOptions): TRPCContext => {
  return {
    ...opts,
    prisma,
  };
};

/**
 * This is the actual context you will use in your router. It will be used to process every request
 * that goes through your tRPC endpoint.
 *
 * @see https://trpc.io/docs/context
 */
export const createTRPCContext = async (): Promise<TRPCContext> => {
  const userId = auth().userId;
  const mockUserId = cookies().get("harmony-user-id")?.value;
  const session = await getServerAuthSession(mockUserId ?? userId);

  return createInnerTRPCContext({
    session,
  });
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

// check if the user is signed in with an account, otherwise throw a UNAUTHORIZED CODE
const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.session?.auth.userVacation) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      session: ctx.session as AuthedSession,
    },
  });
});

// check if the user is signed in, otherwise throw a UNAUTHORIZED CODE
const isSession = t.middleware(({ next, ctx }) => {
  if (!ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      session: ctx.session,
    },
  });
});

// const catchErrors = t.middleware(async ({ next, ctx }) => {
//   const result = await next({ ctx });

//   return result;
// });

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
export const sessionProcedure = t.procedure.use(isSession);
