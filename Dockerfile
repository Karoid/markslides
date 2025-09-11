FROM node:18-alpine

# Install Prisma runtime dependencies
RUN apk update \
    && apk add --no-cache openssl\
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /var/cache/apk/*

COPY ./docker/entrypoint.sh /usr/bin/

RUN corepack enable && chmod +x /usr/bin/entrypoint.sh

WORKDIR /app

ENTRYPOINT ["entrypoint.sh"]

EXPOSE 3000

CMD ["npm", "run", "dev"]
