#!/bin/bash

set -e

echo "Preparing application folder for Cloud Foundry deployment\n\n"

CF_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
TOP_LEVEL=${CF_DIR}/../../
BOWER_PATH=${NODE_HOME}/bin


# Copy the config file
cp ${CF_DIR}/config.properties ${TOP_LEVEL}

mv ${TOP_LEVEL}/plugins.json ${TOP_LEVEL}/plugins.json.bk
sed '2 a"cloud-foundry-hosting",' ${TOP_LEVEL}/plugins.json.bk > ${TOP_LEVEL}/plugins.json

# Delete endpoints-dashboard from bower.json
sed -i '/"endpoints-dashboard.*/d' bower.json

npm install -g gulp bower

cd ${TOP_LEVEL}

npm install --only=prod & NPM_INSTALL=$!
${BOWER_PATH}/bower install & BOWER_INSTALL=$!

wait ${NPM_INSTALL}
npm run build-backend & BK_BUILD=$!

wait ${BOWER_INSTALL}
npm run build & UI_BUILD=$!

wait ${BK_BUILD}
wait ${UI_BUILD}
npm run build-cf

chmod +x portal-proxy

./portal-proxy

