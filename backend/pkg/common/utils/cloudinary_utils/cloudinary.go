package cloudinaryutils

import (
	"context"
	"errors"
	"mime/multipart"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api"
	"github.com/cloudinary/cloudinary-go/v2/api/admin"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
)

type AvatarUploader interface {
	UploadAvatar(file *multipart.FileHeader, patientId uuid.UUID) (string, error)
}

type CloudinaryUploader struct{}

func NewAvatarUploader() AvatarUploader {
	return &CloudinaryUploader{}
}

func Credentials() (*cloudinary.Cloudinary, context.Context) {
	// add your cloudinary credentials
	cld, _ := cloudinary.New()
	cld.Config.URL.Secure = true
	ctx := context.Background()
	return cld, ctx
}

func UploadImage(cld *cloudinary.Cloudinary, ctx context.Context, file *multipart.FileHeader, patientId uuid.UUID) (*uploader.UploadResult, error) {
	// Set the asset's public ID and allow overwriting the asset with new versions
	resp, err := cld.Upload.Upload(ctx, file, uploader.UploadParams{
		PublicID:       patientId.String(),
		UniqueFilename: api.Bool(false),
		Overwrite:      api.Bool(true),
	})
	if err != nil {
		return nil, err
	}
	logrus.Infof("Uploading Portrait Image by Delivery URL: %s", resp.SecureURL)
	return resp, nil
}

func GetAssetInfo(cld *cloudinary.Cloudinary, ctx context.Context) {
	// get and use details of portrait_patient
	resp, err := cld.Admin.Asset(ctx, admin.AssetParams{
		PublicID: "portrait_patient",
	})
	if err != nil {
		logrus.Error(err)
	}
	logrus.Info("Get and use details of portrait_patient", resp)

	// assign tags to the uploaded image
	if resp.Width > 900 {
		update_resp, err := cld.Admin.UpdateAsset(ctx, admin.UpdateAssetParams{
			PublicID: "portrait_patient",
			Tags:     []string{"large"},
		})
		if err != nil {
			logrus.Error(err)
		}
		logrus.Info("New tags for image:", update_resp.Tags)
	} else {
		update_resp, err := cld.Admin.UpdateAsset(ctx, admin.UpdateAssetParams{
			PublicID: "portrait_patient",
			Tags:     []string{"small"},
		})
		if err != nil {
			logrus.Error(err)
		}
		logrus.Info("New tags for image:", update_resp.Tags)
	}
}

func TransformImage(cld *cloudinary.Cloudinary, ctx context.Context) {
	// Instantiate an object for the asset with public ID "my_image"
	qs_img, err := cld.Image("portrait_patient")
	if err != nil {
		logrus.Error(err)
	}

	// Add the transformation
	// Transformations create a modified copy of your original image. In this case, radius="max" creates a copy with rounded edges and effect="sepia" applies a special effect.
	qs_img.Transformation = "w_761,h_761"

	// Generate and log the delivery URL
	new_url, err := qs_img.String()
	if err != nil {
		logrus.Error(err)
	} else {
		logrus.Infof("Transform the image --> Transfrmation URL: %v \n", new_url)
	}
}

func CreateAvatar(cld *cloudinary.Cloudinary, patientId uuid.UUID) (string, error) {
	img, err := cld.Image(patientId.String())
	if err != nil {
		return "", err
	}

	img.Transformation = "w_150,h_150,c_thumb,g_face,r_max"

	avatarUrl, err := img.String()
	if err != nil {
		return "", err
	}
	return avatarUrl, nil
}

func HandleCreateAvatar(file *multipart.FileHeader, patientId uuid.UUID) (string, error) {
	if file == nil {
		return "", errors.New("File is empty")
	}

	cld, uploadCtx := Credentials()
	if cld == nil {
		return "", errors.New("Missing cloudinary configured")
	}

	uploadResult, err := UploadImage(cld, uploadCtx, file, patientId)
	if err != nil {
		return "", err
	}

	var uploadedAvatarUrl string
	if uploadResult != nil && uploadResult.SecureURL != "" {
		avtarUrl, err := CreateAvatar(cld, patientId)
		if err != nil {
			return "", err
		}
		uploadedAvatarUrl = avtarUrl
	}

	return uploadedAvatarUrl, nil
}

func (cld *CloudinaryUploader) UploadAvatar(file *multipart.FileHeader, patientId uuid.UUID) (string, error) {
	return HandleCreateAvatar(file, patientId)
}

