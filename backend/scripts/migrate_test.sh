#!/bin/sh
export DATABASE_URL=postgres://postgres:Quockhanh208@@postgres:5432/clinic_test?sslmode=disable
# dùng migrate tool hoặc Bun migration
go run ./cmd/main.go
