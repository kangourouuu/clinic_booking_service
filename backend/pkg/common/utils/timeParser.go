package utils

import (
	"time"
)

func ParseTime(timeString string) (time.Time, error) {
	t, err := time.Parse("02/01/2006", timeString)

	if err != nil {
		// logrus.Infof("Failed to parse string to time: %v", err)
		return t, err
	}
	return t, nil
}
