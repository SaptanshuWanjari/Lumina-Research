FROM node:22-alpine AS deps

WORKDIR /apps/website

COPY apps/website/package.json apps/website/package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build

WORKDIR /apps/website

ENV NODE_ENV=production

COPY --from=deps /apps/website/node_modules ./node_modules
COPY apps/website/ ./
RUN npm run build

FROM node:22-alpine AS runtime

WORKDIR /apps/website

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

COPY --from=build /apps/website/package.json ./package.json
COPY --from=build /apps/website/package-lock.json ./package-lock.json
COPY --from=build /apps/website/node_modules ./node_modules
COPY --from=build /apps/website/.next ./.next
COPY --from=build /apps/website/public ./public
COPY --from=build /apps/website/app ./app

EXPOSE 3000

CMD ["npm", "run", "start", "--", "--hostname", "0.0.0.0", "--port", "3000"]
