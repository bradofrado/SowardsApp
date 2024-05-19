import { appRouter } from 'api/src/index';
import { createTRPCContext } from 'api/src/trpc';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

const handler = (request: Request) => {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req: request,
    router: appRouter,
    createContext: ({req}) => createTRPCContext(),
  });
}

export const GET = handler;
export const POST = handler;