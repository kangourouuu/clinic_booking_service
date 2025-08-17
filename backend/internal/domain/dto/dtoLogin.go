package dto

type LoginRequest struct {
	PhoneNumber    string `json:"phone_number"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token   string      `json:"token"`
	User    interface{} `json:"user"`
	Message string      `json:"message"`
}
