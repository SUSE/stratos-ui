#!/usr/bin/env bash
set -eux

DOCKER_REGISTRY=${DOCKER_REGISTRY:-docker.io}
DOCKER_ORG=${DOCKER_ORG:-splatform}
NAME=stratos-proxy-builder
TAG=${TAG:-test}

STRATOS_UI_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/../../../stratos-ui"

pushd ${STRATOS_UI_PATH}
pushd $(git rev-parse --show-toplevel)

SHARED_IMAGE_URL=${DOCKER_REGISTRY}/${DOCKER_ORG}/${NAME}:${TAG}

echo "Building Docker Image for $NAME"
pushd deploy

# Generate Glide cache
cat << EOT > ../run-glide.sh
#!/bin/sh
BACKEND_PATHS=\$(find /stratos-ui/components -name backend)
for backend in \${BACKEND_PATHS};
do
    cd \$backend
    glide install;
done
EOT
chmod +x ../run-glide.sh

docker run \
       -ti \
       --rm \
       -e GLIDE_HOME=/.glide \
       -e HOME=/stratos-ui \
       --volume ${PWD}/glide-cache:/.glide \
       --volume $PWD/../:/stratos-ui \
       splatform/stratos-bk-build-base:latest \
       sh /stratos-ui/run-glide.sh

# Generate NPM cache
docker run \
       -ti \
       --rm \
       --volume ${PWD}/npm-cache:/root/.npm \
       --volume $PWD/..:/stratos-ui \
       splatform/stratos-bk-build-base:latest \
       sh  -c "cd /stratos-ui && npm install"

docker build --tag ${NAME} \
             --file Dockerfile.bk.build .

sudo rm -rf ./glide-cache
sudo rm -rf ./npm-cache
rm -rf ../run-glide.sh
rm -rf ../vendor/

popd

echo "Tag and push the shared image"
docker tag ${NAME} ${SHARED_IMAGE_URL}
docker push ${SHARED_IMAGE_URL}
