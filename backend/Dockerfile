FROM golang:1.24-alpine
WORKDIR /app
COPY go.mod ./
COPY go.sum ./
RUN go mod download
COPY . .
COPY .air.toml ./
RUN go install github.com/cosmtrek/air@v1.40.4

EXPOSE 9000
CMD ["air", "-c", ".air.toml"]