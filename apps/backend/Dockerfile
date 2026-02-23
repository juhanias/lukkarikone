FROM oven/bun:latest AS builder

WORKDIR /app

ENV NODE_ENV=production
ENV LOG_LEVEL=info

COPY package.json ./
RUN bun install

COPY . .

ARG BUN_TARGET=bun-linux-x64
RUN bun build --compile --minify-whitespace --minify-syntax --target ${BUN_TARGET} --outfile server ./src/index.ts

FROM debian:bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV LOG_LEVEL=info

RUN apt-get update \
	&& apt-get install -y --no-install-recommends ca-certificates \
	&& rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/server ./server

EXPOSE 3001

CMD ["./server"]