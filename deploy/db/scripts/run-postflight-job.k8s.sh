#!/bin/sh
set -e

execStatement() {
    stmt=$1
    PGPASSFILE=/tmp/pgpass psql -U $POSTGRES_USER -h $PGSQL_HOST -p $PGSQL_PORT -d postgres -w -tc "$stmt"
}

execBackupRestore() {
    orig_server="hsc-stproxy-int"
    dest_server=$PGSQL_HOST
    bkup="pg_dump -U $PGSQL_USER -h $orig_server -p $PGSQL_PORT -w $PGSQL_DATABASE"
    stor="psql -U $PGSQL_USER -h $dest_server -p $PGSQL_PORT -w $PGSQL_DATABASE"

    PGPASSFILE=/tmp/pgpass $bkup | PGPASSFILE=/tmp/pgpass $stor
}

# Save the superuser info to file to ensure secure access
echo "*:$PGSQL_PORT:postgres:$POSTGRES_USER:$(cat $POSTGRES_PASSWORD_FILE)" > /tmp/pgpass
echo "*:$PGSQL_PORT:$PGSQL_DATABASE:$PGSQL_USER:$(cat $PGSQL_PASSWORDFILE)" >> /tmp/pgpass
chmod 0600 /tmp/pgpass

# Get Stackato user password from secrets file
PWD=$(cat $PGSQL_PASSWORDFILE)

# Create the database if necessary
stackatoDbExists=$(execStatement "SELECT 1 FROM pg_database WHERE datname = '$PGSQL_DATABASE';")
if [ -z "$stackatoDbExists" ] ; then
    echo "Creating database $PGSQL_DATABASE"
    execStatement "CREATE DATABASE \"$PGSQL_DATABASE\";"
    echo "Creating user $PGSQL_USER"
    execStatement "CREATE USER $PGSQL_USER WITH ENCRYPTED PASSWORD '$PWD';"
    echo "Granting privs for $PGSQL_DATABASE to $PGSQL_USER"
    execStatement "GRANT ALL PRIVILEGES ON DATABASE \"$PGSQL_DATABASE\" TO $PGSQL_USER;"
else
    echo "$PGSQL_DATABASE already exists"
fi

# Backup existing stackato-db database from stolon cluster and restore it to the single instance
#execBackupRestore

# Migrate the database if necessary
echo "Checking database to see if migration is necessary."

# Check the version
echo "Checking database version."
PGSQL_PASSWORD=$PWD goose --env=k8s dbversion

# Check the status
echo "Checking database status."
PGSQL_PASSWORD=$PWD goose --env=k8s status

# Run migrations
echo "Attempting database migrations."
PGSQL_PASSWORD=$PWD goose --env=k8s up

# CHeck the status
echo "Checking database status."
PGSQL_PASSWORD=$PWD goose --env=k8s status

# Check the version
echo "Checking database version."
PGSQL_PASSWORD=$PWD goose --env=k8s dbversion

echo "Database operation(s) complete."


# Remove the lock file on the shared volume
echo "Removing the $UPGRADE_LOCK_FILENAME file from the shared upgrade volume $UPGRADE_VOLUME."
rm /$UPGRADE_VOLUME/$UPGRADE_LOCK_FILENAME || true

echo "Removed the upgrade lock file."

exit 0
