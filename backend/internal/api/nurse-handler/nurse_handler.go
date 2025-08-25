package nursehandler

import (
	"backend/internal/domain/dto"
	dtonurse "backend/internal/domain/dto/dto_nurse"
	dtoqueue "backend/internal/domain/dto/queue"
	"backend/internal/infrastructure/redis"
	nurseusecase "backend/internal/usecase/nurse-usecase"
	serviceusecase "backend/internal/usecase/service_usecase"
	errorsresponse "backend/pkg/app_response/errors_response"
	"backend/pkg/app_response/response"
	"backend/pkg/common/pagination"
	"backend/pkg/constants"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/sirupsen/logrus"
)

type NurseHandler struct {
	nurseSvc  nurseusecase.NurseUsecase
	mqUsecase serviceusecase.BookingQueueUseCase
	redis     redis.RedisClient
}

func NewNurseHandler(nurseSvc nurseusecase.NurseUsecase, mqUsecase serviceusecase.BookingQueueUseCase, redis redis.RedisClient) *NurseHandler {
	return &NurseHandler{
		nurseSvc:  nurseSvc,
		mqUsecase: mqUsecase,
		redis:     redis,
	}
}

func (h *NurseHandler) CreateNurse(ctx *gin.Context) {
	var req dtonurse.CreateNurseRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorsresponse.NewCustomErrResponse(http.StatusBadRequest, "invalid input"))
		logrus.Error(err)
		return
	}

	err := h.nurseSvc.CreateNurse(ctx, &req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorsresponse.NewCustomErrResponse(http.StatusInternalServerError, err.Error()))
		logrus.Error(err)
		return
	}

	ctx.JSON(http.StatusCreated, response.NewCustomSuccessResponse(http.StatusCreated, &req, "Created a new nurse"))
}

func (h *NurseHandler) LoginNurse(ctx *gin.Context) {
	var req dto.LoginRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorsresponse.NewCustomErrResponse(http.StatusBadRequest, "Email or Password incorrect"))
		logrus.Error(err)
		return
	}

	resp, err := h.nurseSvc.Login(ctx, &req)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, errorsresponse.NewCustomErrResponse(http.StatusUnauthorized, err.Error()))
		logrus.Error(err)
		return
	}

	ctx.SetCookie("clinic_token", resp.Token, 3600*24, "/", "", false, true)

	ctx.JSON(http.StatusOK, response.NewCustomSuccessResponse(http.StatusOK, &resp, "Nurse login successfully"))
}

func (h *NurseHandler) GetNurses(ctx *gin.Context) {
	var paginationReq pagination.Pagination
	if err := ctx.ShouldBindQuery(&paginationReq); err != nil {
		ctx.JSON(http.StatusBadRequest, errorsresponse.NewCustomErrResponse(http.StatusBadRequest, "invalid page"))
	}

	n, err := h.nurseSvc.GetNurses(ctx, &paginationReq)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorsresponse.NewCustomErrResponse(http.StatusInternalServerError, err.Error()))
		return
	}

	fullResp := dto.PaginationResponse[dtonurse.NurseResponse]{
		Data:       n,
		Pagination: &paginationReq,
	}
	ctx.JSON(http.StatusOK, response.NewCustomSuccessResponse(http.StatusOK, &fullResp, "Data fetch"))
}

func (h *NurseHandler) GetNurseById(ctx *gin.Context) {
	id := ctx.Param("id")
	n, err := h.nurseSvc.GetNurseById(ctx, id)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorsresponse.NewCustomErrResponse(http.StatusInternalServerError, err.Error()))
		logrus.Error(err)
		return
	}

	ctx.JSON(http.StatusOK, response.NewCustomSuccessResponse(http.StatusOK, &n, "Data fetch"))
}

func (h *NurseHandler) UpdateNurse(ctx *gin.Context) {
	var req dtonurse.UpdateNurseRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorsresponse.NewCustomErrResponse(http.StatusBadRequest, "invalid input"))
		logrus.Error(err)
		return
	}
	id := ctx.Param("id")
	err := h.nurseSvc.UpdateNurseById(ctx, id, &req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorsresponse.NewCustomErrResponse(http.StatusInternalServerError, err.Error()))
		logrus.Error(err)
		return
	}

	ctx.JSON(http.StatusOK, response.NewCustomSuccessResponse(http.StatusOK, &req, "Nurse updated"))
}

func (h *NurseHandler) DeleteNurse(ctx *gin.Context) {
	id := ctx.Param("id")
	err := h.nurseSvc.DeleteNurseById(ctx, id)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorsresponse.NewCustomErrResponse(http.StatusInternalServerError, "Failed to delete nurse"))
		logrus.Error(err)
		return
	}
	ctx.JSON(http.StatusOK, response.NewCustomSuccessResponse(http.StatusOK, id, "Nurse deleted"))
}

func (h *NurseHandler) GetNurseProfile(ctx *gin.Context) {
	nurseId, exists := ctx.Get("nurse")
	if !exists {
		ctx.JSON(http.StatusInternalServerError, errorsresponse.NewCustomErrResponse(http.StatusInternalServerError, "Nurse ID not found"))
		return
	}
	nurseIdStr, ok := nurseId.(string)
	if !ok {
		ctx.JSON(http.StatusInternalServerError, errorsresponse.NewCustomErrResponse(http.StatusInternalServerError, "Invalid nurse ID format"))
		return
	}

	nurse, err := h.nurseSvc.GetNurseById(ctx, nurseIdStr)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorsresponse.NewCustomErrResponse(http.StatusInternalServerError, "Failed to fetch nurse profile"))
		return
	}

	ctx.JSON(http.StatusOK, response.NewCustomSuccessResponse(http.StatusOK, &nurse, "Nurse profile fetched"))
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

type ClientWS struct {
	conn *websocket.Conn
	send chan []byte
}

func (cws *ClientWS) writeMsg() {
	for msg := range cws.send {
		if err := cws.conn.WriteMessage(websocket.TextMessage, msg); err != nil {
			logrus.Errorf("write error: %s", err)
			return
		}
	}
}

func (h *NurseHandler) GetAllBookingQueues(ctx *gin.Context) {

	conn, err := upgrader.Upgrade(ctx.Writer, ctx.Request, nil)
	if err != nil {
		log.Println(err)
		return
	}

	defer logrus.Info("Connection is closing ...")
	defer conn.Close()

	client := &ClientWS{
		conn: conn,
		send: make(chan []byte, 256),
	}

	go client.writeMsg()

	_, _, err = conn.ReadMessage()
	if err != nil {
		log.Println(err)
		return
	}

	var paginationReq pagination.Pagination
	err = ctx.ShouldBindQuery(&paginationReq)
	if err != nil {
		conn.WriteMessage(websocket.TextMessage, []byte(err.Error()))
		return
	}

	var bqResponse []*dtoqueue.BookingQueueResponse
	mapBookingQueue, err := h.redis.HGetAll(ctx, "queue")
	if err != nil {
		conn.WriteMessage(websocket.TextMessage, []byte(err.Error()))
		return
	}

	if mapBookingQueue == nil {
		resp, err := h.mqUsecase.GetBookingQueues(ctx, &paginationReq)
		if err != nil {
			conn.WriteMessage(websocket.TextMessage, []byte(err.Error()))
			return
		}

		var id int
		for _, q := range resp {
			id = q.QueueId
		}

		respMarshaled, err := json.Marshal(&resp)
		if err != nil {
			conn.WriteMessage(websocket.TextMessage, []byte(err.Error()))
			return
		}

		_, err = h.redis.HSet(ctx, "queue", id, respMarshaled)
		if err != nil {
			conn.WriteMessage(websocket.TextMessage, []byte(err.Error()))
			return
		}
	}

	for _, v := range mapBookingQueue {
		var bq dtoqueue.BookingQueueResponse
		err := json.Unmarshal([]byte(v), &bq)
		if err != nil {
			conn.WriteMessage(websocket.TextMessage, []byte(err.Error()))
			return
		}
		bqResponse = append(bqResponse, &bq)
	}

	// fullResp := dto.PaginationResponse{
	// 	Data:       bqResponse,
	// 	Pagination: &paginationReq,
	// }

	initalData := map[string]interface{}{
		"type": "queue_list",
		"data": bqResponse,
	}

	bqresp, err := json.Marshal(initalData)
	if err != nil {
		conn.WriteMessage(websocket.TextMessage, []byte(err.Error()))
		return
	}

	client.send <- bqresp

	go func() {
		sub := h.redis.SubChannel(ctx, constants.CHANNEL_REDIS)
		ch := sub.Channel()
		for message := range ch {
			// When Redis trigger received, fetch fresh data and send to WebSocket
			if message.Payload == "updated" {
				var bqResponse []*dtoqueue.BookingQueueResponse
				mapBookingQueue, err := h.redis.HGetAll(ctx, "queue")
				if err != nil {
					conn.WriteMessage(websocket.TextMessage, []byte(err.Error()))
					return
				}

				if mapBookingQueue == nil {
					resp, err := h.mqUsecase.GetBookingQueues(ctx, &paginationReq)
					if err != nil {
						conn.WriteMessage(websocket.TextMessage, []byte(err.Error()))
						return
					}

					var id int
					for _, q := range resp {
						id = q.QueueId
					}

					respMarshaled, err := json.Marshal(&resp)
					if err != nil {
						conn.WriteMessage(websocket.TextMessage, []byte(err.Error()))
						return
					}

					_, err = h.redis.HSet(ctx, "queue", id, respMarshaled)
					if err != nil {
						conn.WriteMessage(websocket.TextMessage, []byte(err.Error()))
						return
					}
				}

				for _, v := range mapBookingQueue {
					var bq dtoqueue.BookingQueueResponse
					err := json.Unmarshal([]byte(v), &bq)
					if err != nil {
						conn.WriteMessage(websocket.TextMessage, []byte(err.Error()))
						return
					}
					bqResponse = append(bqResponse, &bq)
				}

				// fullResp := dto.PaginationResponse{
				// 	Data:       bqResponse,
				// 	Pagination: &paginationReq,
				// }

				initalData := map[string]interface{}{
					"type": "queue_list",
					"data": bqResponse,
				}

				bqresp, err := json.Marshal(initalData)
				if err != nil {
					conn.WriteMessage(websocket.TextMessage, []byte(err.Error()))
					return
				}

				client.send <- bqresp
			} else {
				// Handle other message types
				conn.WriteMessage(websocket.TextMessage, []byte(message.Payload))
			}
		}
	}()

	for {
		select {
		case <-ctx.Done():
			return
		default:
			time.Sleep(4 * time.Hour)
		}
	}
}

func (h *NurseHandler) MarkCompleteQueue(ctx *gin.Context) {
	queueIdStr := ctx.Query("queueId")
	if queueIdStr == "" {
		ctx.JSON(http.StatusBadRequest, errorsresponse.NewCustomErrResponse(http.StatusBadRequest, "invalid queue id"))
		return
	}

	err := h.redis.HDel(ctx, "queue", queueIdStr)
	if err != nil {
		logrus.Error(err)
		ctx.JSON(http.StatusInternalServerError, errorsresponse.NewCustomErrResponse(http.StatusInternalServerError, "Error has occur when mark complete this patient"))
		return
	}

	queueId, err := strconv.Atoi(queueIdStr)
	if err != nil {
		logrus.Errorf("Handler layer: %v", err)
		ctx.JSON(http.StatusBadRequest, errorsresponse.NewCustomErrResponse(http.StatusBadRequest, "Invalid id"))
		return
	}

	err = h.mqUsecase.UpdateBookingStatus(ctx, queueId, "completed")
	if err != nil {
		logrus.Errorf("Handler layer: %v", err)
		ctx.JSON(http.StatusInternalServerError, errorsresponse.NewCustomErrResponse(http.StatusInternalServerError, "Error has occur when updating complete status"))
		return
	}

	ctx.JSON(http.StatusOK, response.NewCustomSuccessResponse(http.StatusOK, queueId, "Completed"))
}
