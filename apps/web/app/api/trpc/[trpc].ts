import { createNextApiHandler } from "@trpc/server/adapters/next";
import { appRouter } from "api/src";
import { createTRPCContext } from "api/src/trpc";

// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
});
