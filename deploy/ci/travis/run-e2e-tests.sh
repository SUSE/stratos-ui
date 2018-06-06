#!/bin/bash

set -e

echo "Stratos e2e tests"
echo "================="

echo "Checking docker version"

docker version
docker-compose version

echo "Preparing for e2e tests..."

curl -sLk -o ./secrets.yaml https://travis.capbristol.com/yaml

echo "Generating certificate"
export CERTS_PATH=./dev-certs
./deploy/tools/generate_cert.sh

# Move the node_modules folder - the docker build will remove it anyway
mv ./node_modules /tmp/node_modules

echo "Building images locally"
./deploy/docker-compose/build.sh -n -l
echo "Build Finished"
docker images

echo "Running Stratos in Docker Compose"
pushd deploy/ci/travis
docker-compose up -d
popd

# The build cleared node_modules, so move back the one we kept
#npm install
rm -rf ./node_modules
mv /tmp/node_modules ./node_modules

set +e
echo "Running e2e tests"
npm run e2e-local
RESULT=$?
set -e

pushd deploy/ci/travis
# Uncomment to copy logs to the travis log
#docker-compose stop
#docker-compose logs mariadb
#docker-compose logs goose
#docker-compose logs proxy 
docker-compose down
popd

# Check environment variable that will ignore E2E failures
if [ -n "${STRATOS_ALLOW_E2E_FAILURES}" ]; then
  echo "Ignoring E2E test failures (if any) because STRATOS_ALLOW_E2E_FAILURES is set"
  exit 0
fi

exit $RESULT
