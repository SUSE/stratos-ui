#!/bin/bash

WORK_DIR=$(pwd)

npm install
npm run customize
export PATH=$PATH:$WORK_DIR/node_modules/.bin

npm run build

# Copy dist folder to the /usr/dist folder when running in docker compose
if [ "$1" == "-u" ]; then
  mkdir -p /usr/dist
  cp -R dist/* /usr/dist
fi