FROM node:20-bookworm-slim AS builder

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.json ./
COPY apps/server/package.json apps/server/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json
COPY packages/eslint-config/package.json packages/eslint-config/package.json

RUN pnpm install --frozen-lockfile

COPY apps/server apps/server
COPY packages/shared packages/shared
COPY packages/typescript-config packages/typescript-config

RUN pnpm --filter @workspace/shared build
RUN pnpm --filter server build

FROM node:20-bookworm-slim AS runner

ENV NODE_ENV=production

WORKDIR /app

RUN useradd --system --create-home --uid 1001 appuser

COPY --from=builder /app/package.json /app/pnpm-workspace.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/server ./apps/server
COPY --from=builder /app/packages/shared ./packages/shared

WORKDIR /app/apps/server

USER appuser

EXPOSE 4000

CMD ["node", "dist/main.js"]
