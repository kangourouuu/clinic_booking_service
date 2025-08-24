package config

import (
	"fmt"

	"github.com/caarlos0/env/v11"
	"github.com/spf13/viper"
)

type MainConfig struct {
	Port     string `mapstructure:"port"`
	LogType  string `mapstructure:"log_type"`
	LogFile  string `mapstructure:"log_file"`
	DB       bool   `mapstructure:"database"`
	Redis    bool   `mapstructure:"redis"`
	RabbitMQ bool   `mapstructure:"rabbitmq"`
}

type Config struct {
	Dir  string     `env:"CONFIG_DIR" envDefault:"config/config.yaml"`
	Main MainConfig `mapstructure:"main"`
}

var AppConfig Config

func InitConfig() error {
	err := env.Parse(&AppConfig)
	if err != nil {
		fmt.Errorf("Failed to parse config: %s", err)
	}

	viper.SetConfigFile(AppConfig.Dir)
	if err := viper.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); ok {
			fmt.Errorf("Not found config file: %v", ok)
		}
		fmt.Errorf("Failed to read config file: %s", err)
	}

	AppConfig.Main.Port = viper.GetString("main.port")
	AppConfig.Main.LogType = viper.GetString("main.log_type")
	AppConfig.Main.LogFile = viper.GetString("main.log_file")
	AppConfig.Main.DB = viper.GetBool("main.database")
	AppConfig.Main.Redis = viper.GetBool("main.redis")
	AppConfig.Main.RabbitMQ = viper.GetBool("main.rabbitmq")

	return nil
}
