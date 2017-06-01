#!/bin/bash

# NOTE: You can execute commands on the docker-container by passing "CMD" arguments into this
#       helper script.  For example: "run_portal_proxy.sh bash"

set -x

pushd $(git rev-parse --show-toplevel)

docker build --tag portal-proxy-server \
             --file Dockerfile.server \
             .

docker run -it \
           --rm \
           --publish 8080:443 \
           --name portal-proxy-server \
           portal-proxy-server $*

popd
