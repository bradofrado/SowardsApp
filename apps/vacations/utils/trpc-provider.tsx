"use client"

import {QueryClient, QueryClientProvider} from "@tanstack/react-query"
import {httpBatchLink} from "@trpc/client"
import {useState} from "react"
import { api } from "./api"
import superjson from "superjson";
import { Clerk } from "@clerk/clerk-js"

const clerk = new Clerk(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '');

const getBaseUrl = (): string => {
  if (typeof window !== "undefined") return ""; // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

export const TrpcProvider: React.FC<{children: React.ReactNode}> = p => {
  const [queryClient] = useState(() => new QueryClient())
  const [trpcClient] = useState(() =>
    api.createClient({
			// config() {
			// 	return {
					/**
					 * Transformer used for data de-serialization from the server.
					 *
					 * @see https://trpc.io/docs/data-transformers
					 */
					transformer: superjson,
		
					/**
					 * Links used to determine request flow from client to server.
					 *
					 * @see https://trpc.io/docs/links
					 */
					links: [
						// loggerLink({
						// 	enabled: (opts) =>
						// 		process.env.NODE_ENV === "development" ||
						// 		(opts.direction === "down" && opts.result instanceof Error),
						// }),
						httpBatchLink({
							url: `${getBaseUrl()}/api/trpc`,
							fetch(url, options) {
								return fetch(url, options).then(async (response) => {
									if (response.status === 401) {
										if (!clerk.loaded) {
											await clerk.load();
										}
										// Redirect to Clerk sign-in page
										await clerk.redirectToSignIn();
										return Promise.reject(new Error('Unauthorized'));
									  }
									  return response;
								})
							}
						}),
					],
		// 		};
		// 	},
		// 	/**
		// 	 * Whether tRPC should await queries when server rendering pages.
		// 	 *
		// 	 * @see https://trpc.io/docs/nextjs#ssr-boolean-default-false
		// 	 */
		// 	ssr: false,
		// })
	}));

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {p.children}
      </QueryClientProvider>
    </api.Provider>
  )
}