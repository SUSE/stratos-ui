#!/bin/bash

set -e

echo "Preparing application folder for Cloud Foundry deployment\n\n"

CF_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
TOP_LEVEL=${CF_DIR}/../../
BOWER_PATH=${NODE_HOME}/bin


# Copy the config file
cp ${CF_DIR}/config.properties ${TOP_LEVEL}

cat << EOF > ${TOP_LEVEL}/plugins.json
{
 "enabledPlugins":[
   "cloud-foundry",
   "cloud-foundry-hosting"	
 ]
}
EOF

npm install -g gulp
npm install -g bower

cd ${TOP_LEVEL}
cat plugins.json

npm install
${BOWER_PATH}/bower install

npm run build
npm run build-backend
npm run build-cf

chmod +x portal-proxy

./portal-proxy

