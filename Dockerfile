# SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
# SPDX-License-Identifier: AGPL-3.0-or-later

FROM node:22-alpine AS build
RUN corepack enable
WORKDIR /src

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/web/package.json apps/web/
COPY packages/db/package.json packages/db/
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm --filter @closeknit/db build \
	&& pnpm --filter @closeknit/web build \
	&& pnpm --filter @closeknit/web deploy --prod --legacy /out \
	&& cp -r apps/web/build /out/build

FROM node:22-alpine
ENV NODE_ENV=production PORT=3000
WORKDIR /app
COPY --from=build --chown=node:node /out ./
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
	CMD wget -qO- http://127.0.0.1:3000/healthz || exit 1
CMD ["node", "build"]
