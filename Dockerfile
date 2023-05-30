FROM node:16-alpine AS install-dependencies

WORKDIR /user/src/app

COPY package.json yarn.lock ./

COPY . .


# Creating a build:

FROM node:16-alpine AS create-build

WORKDIR /user/src/app

COPY --from=install-dependencies /user/src/app ./

RUN yarn build

USER node


# Running the application:

FROM node:16-alpine AS run

WORKDIR /user/src/app

COPY --from=install-dependencies /user/src/app/node_modules ./node_modules
COPY --from=create-build /user/src/app/dist ./dist
COPY package.json ./

CMD ["yarn", "start:prod"]
