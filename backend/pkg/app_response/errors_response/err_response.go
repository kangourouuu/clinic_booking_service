package errorsresponse

type ErrResponse struct {
	StatusCode int    `json:"status_code"`
	Message    string `json:"message"`
	Details    string `json:"details,omitempty"`
}

func NewCustomErrResponse(statusCode int, msg string) ErrResponse {
	return ErrResponse{
		StatusCode: statusCode,
		Message:    msg,
	}
}

func (e *ErrResponse) Error() string {
	return e.Message
}
