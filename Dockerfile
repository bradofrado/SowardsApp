FROM node:current-alpine3.18 AS base

FROM base AS builder
RUN apk add --no-cache libc6-compat
RUN apk update
# Set working directory
WORKDIR /app
RUN npm install -g turbo
COPY . .

# Generate a partial monorepo with a pruned lockfile for a target workspace.
# Assuming "vacations" is the name entered in the project's package.json: { name: "vacations" }
RUN turbo prune vacations --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN corepack enable
RUN pnpm install --frozen-lockfile

# Build the project
COPY --from=builder /app/out/full/ .
ARG database_url
ENV DATABASE_URL=${database_url}
RUN pnpm run build --filter=vacations

FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=installer /app/apps/vacations/next.config.js .
COPY --from=installer /app/apps/vacations/package.json .

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nextjs:nodejs /app/apps/vacations/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/vacations/.next/static ./apps/vacations/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/vacations/public ./apps/vacations/public

EXPOSE 3000
CMD node apps/vacations/server.js