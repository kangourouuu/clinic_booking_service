package patientrepository

import (
	dtopatient "backend/internal/domain/dto/dto_patient"
	"backend/internal/domain/patient"
	"backend/pkg/common/pagination"
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

type PatientRepository interface {
	CreatePatient(ctx context.Context, m *patient.Patient) error
	GetPatientById(ctx context.Context, id uuid.UUID) (*patient.Patient, error)
	GetPatients(ctx context.Context, pagination *pagination.Pagination) ([]*patient.Patient, error)
	UpdatePatient(ctx context.Context, id uuid.UUID, m *patient.Patient) error
	DeletePatientById(ctx context.Context, id uuid.UUID) error
	GetPatientByPhoneNumber(ctx context.Context, phoneNumber string) (*patient.Patient, error)
	BuildPatientModelForCreate(d *dtopatient.CreatePatientRequest, t time.Time, hashedPassword []byte, nextOfKinInfo []patient.NextOfKinInfo, drugAllergies, diseaseTreatmentHistory []string) (*patient.Patient, error)
	BuildPatientModelForUpdate(ud *dtopatient.UpdatePatientRequest, t time.Time, hashedPassword []byte, nextOfKinInfo []patient.NextOfKinInfo, drugAllergies, diseaseTreatmentHistory []string, existingPatient *patient.Patient) (*patient.Patient, error)
}

type patientRepo struct {
	db *bun.DB
}

func NewPatientRepo(db *bun.DB) PatientRepository {
	repo := &patientRepo{db: db}
	_ = repo.migrate()
	return repo
}

func (r *patientRepo) BuildPatientModelForCreate(d *dtopatient.CreatePatientRequest, t time.Time, hashedPassword []byte, nextOfKinInfo []patient.NextOfKinInfo, drugAllergies, diseaseTreatmentHistory []string) (*patient.Patient, error) {

	// Create medical history with the patient ID
	m := patient.MedicalHistory{
		MedicalHistoryId:        uuid.New(),
		DrugAllergies:           drugAllergies,
		DiseaseTreatmentHistory: diseaseTreatmentHistory,
		OtherHistory:            d.OtherHistory,
		PatientId:               d.PatientId,
	}

	ge := patient.GeneralExamination{
		GeneralExamID: uuid.New(),
		VitalSigns:    d.VitalSigns,
		Temperature:   d.Temperature,
		Weight:        d.Weight,
		Height:        d.Height,
		BMI:           d.BMI,
		PatientId:     d.PatientId,
	}

	p := patient.Patient{
		PatientId:          d.PatientId,
		FullName:           d.FullName,
		DoB:                t,
		Gender:             d.Gender,
		PhoneNumber:        d.PhoneNumber,
		Password:           string(hashedPassword), // replace with hashed password
		Email:              d.Email,
		Address:            d.Address,
		PortraitPhotoURL:   d.PortraitPhotoURL,
		HealthInsuranceID:  d.HealthInsuranceID,
		CitizenID:          d.CitizenID,
		NextOfKinInfo:      nextOfKinInfo,
		CreatedAt:          time.Now(),
		MedicalHistory:     &m,
		GeneralExamination: &ge,
	}
	return &p, nil
}

func (r *patientRepo) BuildPatientModelForUpdate(ud *dtopatient.UpdatePatientRequest, t time.Time, hashedPassword []byte, nextOfKinInfo []patient.NextOfKinInfo, drugAllergies, diseaseTreatmentHistory []string, existingPatient *patient.Patient) (*patient.Patient, error) {

	var medicalHistoryId uuid.UUID
	var patientId uuid.UUID = ud.PatientId

	if existingPatient.MedicalHistory != nil {
		medicalHistoryId = existingPatient.MedicalHistory.MedicalHistoryId
	} else {
		medicalHistoryId = uuid.New()
	}

	m := patient.MedicalHistory{
		MedicalHistoryId:        medicalHistoryId,
		PatientId:               patientId,
		DrugAllergies:           drugAllergies,
		DiseaseTreatmentHistory: diseaseTreatmentHistory,
		OtherHistory:            ud.OtherHistory,
	}

	var generalExamId uuid.UUID
	if existingPatient.GeneralExamination != nil {
		generalExamId = existingPatient.GeneralExamination.GeneralExamID
	} else {
		generalExamId = uuid.New()
	}

	ge := patient.GeneralExamination{
		GeneralExamID: generalExamId,
		PatientId:     patientId,
		VitalSigns:    ud.VitalSigns,
		Temperature:   ud.Temperature,
		Weight:        ud.Weight,
		Height:        ud.Height,
		BMI:           ud.BMI,
	}

	p := patient.Patient{
		PatientId:          patientId,
		FullName:           ud.FullName,
		DoB:                t,
		Gender:             ud.Gender,
		PhoneNumber:        ud.PhoneNumber,
		Password:           string(hashedPassword), // replace with hashed password
		Email:              ud.Email,
		Address:            ud.Address,
		PortraitPhotoURL:   ud.PortraitPhotoURL,
		HealthInsuranceID:  ud.HealthInsuranceID,
		CitizenID:          ud.CitizenID,
		NextOfKinInfo:      nextOfKinInfo,
		CreatedAt:          existingPatient.CreatedAt,
		MedicalHistory:     &m,
		GeneralExamination: &ge,
	}
	return &p, nil
}

func (r *patientRepo) CreatePatient(ctx context.Context, m *patient.Patient) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		logrus.Errorf("Failed to create transaction: %v", err)
		return err
	}
	defer tx.Rollback()

	// Insert patient first
	_, err = tx.NewInsert().Model(m).Exec(ctx)
	if err != nil {
		logrus.Errorf("Failed to create patient: %v", err)
		return err
	}

	// Insert medical history if provided
	if m.MedicalHistory != nil {
		_, err = tx.NewInsert().Model(m.MedicalHistory).Exec(ctx)
		if err != nil {
			logrus.Errorf("Failed to create medical history of patient: %v", err)
			return err
		}
	}

	// Insert medical history if provided
	if m.GeneralExamination != nil {
		_, err = tx.NewInsert().Model(m.GeneralExamination).Exec(ctx)
		if err != nil {
			logrus.Errorf("Failed to create general examination of patient: %v", err)
			return err
		}
	}

	// Commit transaction
	err = tx.Commit()
	if err != nil {
		logrus.Errorf("Failed to commit transaction: %v", err)
		return err
	}

	return nil
}

func (r *patientRepo) GetPatientByPhoneNumber(ctx context.Context, phoneNumber string) (*patient.Patient, error) {
	p := &patient.Patient{}
	err := r.db.NewSelect().Model(p).Relation("MedicalHistory").Relation("GeneralExamination").Where("phone_number = ?", phoneNumber).Scan(ctx)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("patient not found")
		}
		logrus.Errorf("Failed to get patient by phone %s: %v", phoneNumber, err)
		return nil, err
	}
	return p, nil
}

func (r *patientRepo) GetPatientById(ctx context.Context, patientId uuid.UUID) (*patient.Patient, error) {
	p := &patient.Patient{}
	err := r.db.NewSelect().Model(p).Relation("MedicalHistory").Relation("GeneralExamination").Where("patient.patient_id=?", patientId).Scan(ctx)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("patient not found")
		}
		logrus.Errorf("Failed to get patient by ID %s: %v", patientId, err)
		return nil, err
	}
	return p, nil
}

func (r *patientRepo) GetPatients(ctx context.Context, pagination *pagination.Pagination) ([]*patient.Patient, error) {

	var p []*patient.Patient
	limit := pagination.GetLimit()
	offset := pagination.GetOffSet()
	total, err := r.db.NewSelect().Model(&p).Count(ctx)
	if err != nil {
		return nil, err
	}
	pagination.Total = int64(total)

	err = r.db.NewSelect().Model(&p).Limit(limit).Offset(offset).Relation("MedicalHistory").Relation("GeneralExamination").Scan(ctx)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("patient not found")
		}
		logrus.Errorf("Failed to get patient: %v", err)
		return nil, err
	}
	return p, nil
}

func (r *patientRepo) UpdatePatient(ctx context.Context, patientId uuid.UUID, m *patient.Patient) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		logrus.Errorf("Failed to create transaction: %v", err)
		return err
	}
	defer tx.Rollback()

	result, err := tx.NewUpdate().Model(m).Where("patient_id = ?", patientId).Exec(ctx)
	if err != nil {
		logrus.Errorf("Failed to update patient: %v", err)
		return err
	}

	medicalHistoryId := m.MedicalHistory.MedicalHistoryId
	if m.MedicalHistory != nil {
		_, err := tx.NewUpdate().Model(m.MedicalHistory).Where("medical_history_id = ?", medicalHistoryId).Exec(ctx)
		if err != nil {
			logrus.Errorf("Failed to update medical history: %v", err)
			return err
		}
	}
	generalExaminationId := m.GeneralExamination.GeneralExamID
	if m.GeneralExamination != nil {
		_, err := tx.NewUpdate().Model(m.GeneralExamination).Where("general_id = ?", generalExaminationId).Exec(ctx)
		if err != nil {
			logrus.Errorf("Failed to update general examination: %v", err)
			return err
		}
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		logrus.Errorf("Failed to get rows affected for patient ID %s: %v", patientId, err)
		return err
	}

	if rowsAffected == 0 {
		return errors.New("patient not found")
	}

	err = tx.Commit()
	if err != nil {
		logrus.Infof("Failed to commit transaction: %v", err)
		return err
	}

	return nil
}
func (r *patientRepo) DeletePatientById(ctx context.Context, patientId uuid.UUID) error {
	result, err := r.db.NewDelete().Model(&patient.Patient{}).Where("patient_id = ?", patientId).Exec(ctx)
	if err != nil {
		logrus.Errorf("Failed to delete patient ID %s: %v", patientId, err)
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		logrus.Errorf("Failed to get rows affected for patient ID %s: %v", patientId, err)
		return err
	}

	if rowsAffected == 0 {
		return errors.New("patient not found")
	}

	return nil
}

func (r *patientRepo) migrate() error {
	ctx := context.Background()

	// Create patient table first
	_, err := r.db.NewCreateTable().Model(&patient.Patient{}).IfNotExists().Exec(ctx)
	if err != nil {
		logrus.Errorf("failed to migrate patient table: %v", err)
		return err
	}
	logrus.Info("Successfully migrated patient table")

	// Create medical_history table with foreign key
	_, err = r.db.NewCreateTable().
		Model(&patient.MedicalHistory{}).
		IfNotExists().
		ForeignKey(`("patient_id") REFERENCES "patient" ("patient_id") ON DELETE CASCADE`).
		Exec(ctx)
	if err != nil {
		logrus.Errorf("failed to migrate medical_history table: %v", err)
		return err
	}

	_, err = r.db.NewCreateTable().
		Model(&patient.GeneralExamination{}).
		IfNotExists().
		ForeignKey(`("patient_id") REFERENCES "patient" ("patient_id") ON DELETE CASCADE`).
		Exec(ctx)
	if err != nil {
		logrus.Errorf("failed to migrate general_examination table: %v", err)
		return err
	}

	_, err = r.db.NewCreateTable().
		Model(&patient.BookingQueue{}).
		IfNotExists().
		ForeignKey(`("patient_id") REFERENCES "patient" ("patient_id") ON DELETE CASCADE`).
		Exec(ctx)
	if err != nil {
		logrus.Errorf("failed to migrate booking_queue table: %v", err)
		return err
	}

	_, err = r.db.NewCreateTable().
	Model(&patient.DrugReceipt{}).
	IfNotExists().
	WithForeignKeys().
	Exec(ctx)
	if err != nil {
		logrus.Errorf("failed to migrate drug_receipt table: %v", err)
		return err
	}

	return nil
}
