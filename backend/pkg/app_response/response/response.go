package response

type SuccessResponse struct {
	StatusCode int         `json:"status_code"`
	Data       interface{} `json:"data"`
	Message    string      `json:"message"`
}

func NewCustomSuccessResponse(statusCode int, d interface{}, msg string) SuccessResponse {
	return SuccessResponse{
		StatusCode: statusCode,
		Data:       d,
		Message:    msg,
	}
}
