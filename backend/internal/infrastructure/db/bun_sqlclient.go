package db

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/pgdialect"
	"github.com/uptrace/bun/driver/pgdriver"
)

const (
	MYSQL    = "mysql"
	POSTGRES = "postgresql"
)

type DatabaseConnection interface {
	GetDB() *bun.DB
	GetDriver() string
	Ping() error
	Connect() error
}

var DatabaseClient DatabaseConnection

type DatabaseConfig struct {
	Driver       string
	Host         string
	Port         int
	Username     string
	Password     string
	DB           string
	PoolSize     int
	Timeout      time.Duration
	DialTimeout  time.Duration
	WriteTimeout time.Duration
	ReadTimeout  time.Duration
	IdleTimeout  time.Duration
}

type BunDatabaseClient struct {
	DatabaseConfig
	db *bun.DB
}

func NewDatabaseClient(config DatabaseConfig) DatabaseConnection {
	client := BunDatabaseClient{DatabaseConfig: config}
	if err := client.Connect(); err != nil {
		logrus.Fatal("Failed to connect to database", err)
	}
	return &client
}

func (c *BunDatabaseClient) Connect() error {
	switch c.Driver {
	case MYSQL:
		return nil
	case POSTGRES:
		dsn := fmt.Sprintf("postgres://%s:%s@%s:%d/%s?sslmode=disable",
			c.Username, c.Password, c.Host, c.Port, c.DB)
		pgconn := pgdriver.NewConnector(
			pgdriver.WithDSN(dsn),
			pgdriver.WithTimeout(c.Timeout),
			pgdriver.WithDialTimeout(c.DialTimeout),
			pgdriver.WithWriteTimeout(c.WriteTimeout),
			pgdriver.WithReadTimeout(c.ReadTimeout),
		)

		sqldb := sql.OpenDB(pgconn)

		db := bun.NewDB(sqldb, pgdialect.New())

		err := db.Ping()
		if err != nil {
			logrus.Fatalf("Database is not ready: %v", err)
		}

		c.db = db
		logrus.Infof("Connected to %s database on %s:%d", c.Driver, c.Host, c.Port)
		return nil
	default:
		return fmt.Errorf("invalid or unsupported driver: %s", c.Driver)
	}
}

func (c *BunDatabaseClient) Ping() error {
	if c.db == nil {
		return fmt.Errorf("database connection is not initialized")
	}
	return c.db.Ping()
}

func (c *BunDatabaseClient) GetDB() *bun.DB {
	return c.db
}

func (c *BunDatabaseClient) GetDriver() string {
	return c.Driver
}
