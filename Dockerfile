FROM node:20-alpine AS base
RUN apk add --no-cache openssl
WORKDIR /app

FROM base AS deps
RUN npm install --global pnpm@10.19.0
ENV CI=true
COPY package.json pnpm-lock.yaml ./
COPY scripts/security/require-pnpm.js ./scripts/security/require-pnpm.js
RUN pnpm install --frozen-lockfile

FROM deps AS builder
ARG NEXT_PUBLIC_API_URL
COPY . .
# Client generation never needs a production database. No SQL is executed here.
RUN DATABASE_URL=postgresql://build_only:build_only@127.0.0.1:1/build_only pnpm run prisma:generate
RUN DATABASE_URL=postgresql://build_only:build_only@127.0.0.1:1/build_only DISABLE_WEB_DIRECT_DB=true API_URL="$NEXT_PUBLIC_API_URL" BACKEND_URL="$NEXT_PUBLIC_API_URL" pnpm run build
RUN pnpm prune --prod --ignore-scripts
RUN node -e "if(typeof require('@prisma/client').PrismaClient !== 'function') process.exit(1)"

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder --chown=node:node /app/.next ./.next
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/package.json ./package.json
USER node
EXPOSE 3000
CMD ["node", "node_modules/next/dist/bin/next", "start"]


