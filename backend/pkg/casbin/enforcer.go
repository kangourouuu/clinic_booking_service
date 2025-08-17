package casbinusage

import (
	"github.com/casbin/casbin/v2"
	"github.com/sirupsen/logrus"
)

var Enforcer *casbin.Enforcer

func InitCasbin() (*casbin.Enforcer, error) {
	var err error
	Enforcer, err = casbin.NewEnforcer("pkg/casbin/model.conf", "pkg/casbin/policy.csv")
	if err != nil {
		return nil, err
	}

	logrus.Info("Casbin enforcer initialized")
	return Enforcer, nil
}

func Enforce(sub string, obj string, act string) (bool, error) {
	if Enforcer == nil {
		logrus.Fatal("casbin enforcer is not initialized")
	}
	return Enforcer.Enforce(sub, obj, act)
}
