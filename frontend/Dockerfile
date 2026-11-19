ARG SOURCE_STAGE=app-source

FROM node:22-alpine AS app-source
ARG APP
WORKDIR /src
COPY ${APP} ./${APP}

FROM app-source AS panel-source
COPY panel-kit ./panel-kit

FROM ${SOURCE_STAGE} AS builder
ARG APP
ARG API_URL
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_ARTIST_ORIGIN
ENV NEXT_TELEMETRY_DISABLED=1
ENV API_URL=${API_URL}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=${NEXT_PUBLIC_GOOGLE_CLIENT_ID}
ENV NEXT_PUBLIC_ARTIST_ORIGIN=${NEXT_PUBLIC_ARTIST_ORIGIN}
WORKDIR /src/${APP}
RUN npm ci && npm run build
RUN target=".next/standalone/${APP}" \
    && test -f "$target/server.js" \
    && mkdir -p "$target/.next" \
    && cp -R public "$target/public" \
    && cp -R .next/static "$target/.next/static"

FROM node:22-alpine AS runner
ARG APP
ENV APP=${APP}
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
WORKDIR /app
COPY --from=builder --chown=node:node /src/${APP}/.next/standalone ./
USER node
EXPOSE 3000
CMD ["sh", "-c", "exec node \"$APP/server.js\""]
