package container

import (
	doctorhandler "backend/internal/api/doctor-handler"
	nursehandler "backend/internal/api/nurse-handler"
	patienthandler "backend/internal/api/patient-handler"
	servicehandler "backend/internal/api/service_handler"
	"sync"

	doctorrepository "backend/internal/infrastructure/persistence/doctor-repository"
	nurserepository "backend/internal/infrastructure/persistence/nurse-repository"
	patientrepository "backend/internal/infrastructure/persistence/patient-repository"
	serviceRepository "backend/internal/infrastructure/persistence/service-repository"

	doctorusecase "backend/internal/usecase/doctor-usecase"
	nurseusecase "backend/internal/usecase/nurse-usecase"
	patientusecase "backend/internal/usecase/patient-usecase"
	serviceusecase "backend/internal/usecase/service_usecase"

	"github.com/casbin/casbin/v2"
	"github.com/uptrace/bun"
)

// factory
type Container struct {
	db *bun.DB
	// config  *config.Config
	enforce *casbin.Enforcer

	// repo
	patientRepository patientrepository.PatientRepository
	nurseRepository   nurserepository.NurseRepository
	doctorRepository  doctorrepository.DoctorRepository
	serviceRepository serviceRepository.ServiceRepository

	// usecase
	patientUsecase            patientusecase.PatientUsecase
	nurseUsecase              nurseusecase.NurseUsecase
	doctorUsecase             doctorusecase.DoctorUsecase
	serviceCategoryUsecase    serviceusecase.ServiceCategoryUsecase
	serviceSubCategoryUsecase serviceusecase.ServiceSubCategoryUsecase
	serviceUsecase            serviceusecase.ServicesUsecase

	// handler
	patientHandler            patienthandler.PatientHandler
	nurseHandler              nursehandler.NurseHandler
	doctorHandler             doctorhandler.DoctorHandler
	serviceCategoryHandler    servicehandler.ServiceCategoryHandler
	serviceSubCategoryHandler servicehandler.ServiceSubcategoryHandler
	serviceHandler            servicehandler.ServiceHandler

	rwmutex sync.RWMutex
}

func NewContainer(db *bun.DB, enforce *casbin.Enforcer) *Container {
	return &Container{db: db, enforce: enforce}
}
