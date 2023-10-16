import { createTRPCRouter, publicProcedure } from "../trpc";

export const exampleRouter = createTRPCRouter({
	getName: publicProcedure
		.query(() => {
			return 'Hello world!'
		})
})