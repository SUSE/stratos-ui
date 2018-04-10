package datastore

import (
	"database/sql"
	"fmt"
	"strings"

	"bitbucket.org/liamstask/goose/lib/goose"
)

// Up is executed when this migration is applied
func (s *StratosMigrations) Up_20170818162837(txn *sql.Tx, conf *goose.DBConf) {

	consoleConfigTable := "CREATE TABLE IF NOT EXISTS console_config ("
	consoleConfigTable += "  uaa_endpoint              VARCHAR(255)              NOT NULL, "
	consoleConfigTable += "  console_admin_scope       VARCHAR(255)              NOT NULL,"
	consoleConfigTable += "  console_client            VARCHAR(255)              NOT NULL,"
	consoleConfigTable += "  console_client_secret     VARCHAR(255)              NOT NULL, "
	consoleConfigTable += "  skip_ssl_validation       BOOLEAN                   NOT NULL DEFAULT FALSE,"
	consoleConfigTable += "  is_setup_complete         BOOLEAN                   NOT NULL DEFAULT FALSE,"
	consoleConfigTable += "  last_updated              TIMESTAMP                 NOT NULL DEFAULT CURRENT_TIMESTAMP);"

	_, err := txn.Exec(consoleConfigTable)
	if err != nil {
		fmt.Printf("Failed to migrate due to: %v", err)
	}

	// Find a way to ensure this in Mysql
	if strings.Contains(conf.Driver.Name, "postgres") {
		createIndex := "CREATE UNIQUE INDEX console_config_one_row"
		createIndex += "  ON console_config((uaa_endpoint IS NOT NULL));"
		_, err = txn.Exec(createIndex)
		if err != nil {
			fmt.Printf("Failed to migrate due to: %v", err)
		}
	}
}

// Down is executed when this migration is rolled back
func Down_20170818162837(txn *sql.Tx) {
	dropTables := "DROP  TABLE IF EXISTS console_config;"
	_, err := txn.Exec(dropTables)
	if err != nil {
		fmt.Printf("Failed ot migrate due to: %v", err)
	}
	dropTables = "DROP  INDEX IF EXISTS console_config_one_row;"
	_, err = txn.Exec(dropTables)
	if err != nil {
		fmt.Printf("Failed ot migrate due to: %v", err)
	}

}
