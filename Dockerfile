FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml .npmrc ./
ARG GITHUB_TOKEN
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:22-alpine
WORKDIR /app
RUN corepack enable
COPY --from=builder /app ./
EXPOSE 3003
CMD ["sh", "-c", "node_modules/.bin/next start -p ${PORT:-3003}"]
