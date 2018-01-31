#!/bin/bash

set -e

echo "Preparing application folder for Cloud Foundry deployment\n\n"

CF_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
TOP_LEVEL=${CF_DIR}/../../
BOWER_PATH=${NODE_HOME}/bin

export STRATOS_TEMP=$(mktemp -d)

# Copy the config file
cp ${CF_DIR}/config.properties ${TOP_LEVEL}

# Hack for deleting testImports in glide files
# because unfortunately `glide install --skip-test` doesn't seem to work
find . -name glide.lock -exec sed -i '/^testImports.*/q' {} \;
find . -name glide.lock -exec sed -i 's/^testImports:$/testImports: []/g' {} \;

npm install -g gulp

cd ${TOP_LEVEL}

npm install & NPM_INSTALL=$!

wait ${NPM_INSTALL}
# Fetch Glide dependencies, since this is I/O intensive
# it won't interfere with UI build
npm run cf-get-backend-deps & BK_BUILD=$!

npm run build & UI_BUILD=$!
wait ${BK_BUILD}
wait ${UI_BUILD}
# Build backend components
npm run cf-build-backend

npm run build-cf

chmod +x portal-proxy

./portal-proxy
