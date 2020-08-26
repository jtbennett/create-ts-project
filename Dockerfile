FROM node:12.17.0-alpine as node

# ----------------------------------------
# Build the apps.
# ----------------------------------------

FROM node as build

WORKDIR /tmp/build

# ----- Copy only the files that affect yarn install -----

# Allows docker to use cache and skip install if dependencies are unchanged.

COPY package.json /tmp/build/
COPY yarn.lock /tmp/build/
COPY .yarn /tmp/build/

# "tsp dockerfile" will insert a COPY instruction below for each package. 
# The COPY will be in the format:
# COPY packages/__PACKAGE_DIR__/package.json packages/__PACKAGE_DIR__/

# @tsp-packages-copy-package-json - DO NOT MODIFY OR REMOVE THIS LINE.

# Install dependencies exactly as in the yarn.lock file - no updates.
RUN yarn --immutable

# ----- Copy source and all other files that affect lint, test, build -----

COPY config config/
COPY packages packages/
COPY .eslintignore ./
COPY .eslintrc.js ./

# ----- Lint, test and build -----

RUN yarn verify:all

# ----- Bundle apps for deployment -----

RUN packages/ts-project-scripts/lib/index.js bundle --all


# ----------------------------------------
# Copy files to the deployment image.
# ----------------------------------------

FROM node

ENV NODE_ENV=production
ENV PORT=8001
EXPOSE 8001

# This user is created in the base image with uid and gid = 1000.
USER node

# ----- Copy apps -----

# "tsp dockerfile" will insert a COPY instruction below for each package
# with tspConfig.deploy set to true (in its package.json file).
# The COPY will be in the format:
# COPY --from=build --chown=1000:1000 /tmp/build/packages/__PACKAGE_DIR__ /home/node/__PACKAGE_DIR__/

# @tsp-packages-deploy - DO NOT MODIFY OR REMOVE THIS LINE.

ARG APP_VERSION
ENV APP_VERSION ${APP_VERSION:-unknown}

WORKDIR /home/node/my-server

CMD ["node", "./lib/index.js"]
