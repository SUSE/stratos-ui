#!/bin/bash

set -e

echo "Attempting to migrating database"

DB_MIGRATE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DEPLOY_DIR=${DB_MIGRATE_DIR}/../../

export STRATOS_TEMP=$(mktemp -d)

export GOPATH=${DB_MIGRATE_DIR}/goose
export GOBIN=$GOPATH/bin
go get bitbucket.org/liamstask/goose/cmd/goose

export STRATOS_DB_ENV="$STRATOS_TEMP/db.env"
node ${DB_MIGRATE_DIR}/parse_db_environment.js $STRATOS_DB_ENV
source $STRATOS_DB_ENV

function handleGooseResult {
    if [ $? -eq 0 ]; then
        while sleep 60; do echo "Database successfully migrated. Please restart the application via 'cf push -c \"null\"'"; done
    else
        echo Database migration failed
    fi
}

cd $DEPLOY_DIR
case $DB_TYPE in
"postgresql")
    echo "Migrating postgresql instance on $DB_HOST"
    $GOBIN/goose -env cf_postgres up
    handleGooseResult
    ;;
"mysql")
    echo "Migrating mysql instance on $DB_HOST"
    $GOBIN/goose -env cf_mysql up
    handleGooseResult
    ;;
*)
    echo Unknown DB type '$DB_TYPE'
    ;;
esac
