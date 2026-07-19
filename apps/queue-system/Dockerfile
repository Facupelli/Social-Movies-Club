FROM node:20-alpine AS base

RUN corepack enable && corepack prepare pnpm@11.9.0 --activate

WORKDIR /workspace

###################
# LOCAL DEVELOPMENT
###################

FROM base AS development

COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --chown=node:node apps/queue-system/package.json ./apps/queue-system/package.json
COPY --chown=node:node apps/web/package.json ./apps/web/package.json

RUN pnpm install --filter queue-system... --frozen-lockfile

COPY --chown=node:node apps/queue-system ./apps/queue-system

WORKDIR /workspace/apps/queue-system
USER node

###################
# PRODUCTION BUILD
###################

FROM development AS build

USER root
WORKDIR /workspace

RUN pnpm --filter queue-system build
RUN pnpm --filter queue-system deploy --legacy --prod /prod/queue-system
RUN cp -R apps/queue-system/dist /prod/queue-system/dist

###################
# PRODUCTION
###################

FROM node:20-alpine AS production

ENV NODE_ENV=production
WORKDIR /usr/src/app

COPY --chown=node:node --from=build /prod/queue-system ./

USER node

CMD ["node", "dist/main.js"]
