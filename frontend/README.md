# 🏥 MediCare Clinic UI

Giao diện người dùng cho hệ thống quản lý phòng khám MediCare - một ứng dụng web hiện đại được xây dựng với React, Vite và Tailwind CSS.

## 🚀 Tính năng chính

### 👤 Bệnh nhân (Patient)
- ✅ Đăng ký/Đăng nhập tài khoản
- ✅ Upload và resize avatar (156x156)
- ✅ Xem và chỉnh sửa hồ sơ cá nhân
- ✅ Đăng ký dịch vụ khám bệnh theo Category → Subcategory → Service
- ✅ Thanh toán trực tuyến với Stripe Webhook
- ✅ Theo dõi lịch sử khám bệnh

### 👩‍⚕️ Y tá (Nurse)
- ✅ Đăng nhập hệ thống
- ✅ Xem và chỉnh sửa hồ sơ cá nhân
- ✅ Xem danh sách dịch vụ đã đăng ký của bệnh nhân
- ✅ Đánh dấu hoàn thành dịch vụ (Mark Completed)

### 👨‍⚕️ Bác sĩ (Doctor)
- ✅ Đăng nhập hệ thống
- ✅ Xem và chỉnh sửa hồ sơ cá nhân
- ✅ Quản lý lịch trình khám bệnh

## 🎨 Thiết kế UI/UX

- **Giao diện y tế chuyên nghiệp** với tông màu xanh dương nhạt và trắng
- **Background y tế** với hình ảnh liên quan đến chăm sóc sức khỏe
- **Responsive design** tương thích mọi thiết bị
- **Animations mượt mà** với Framer Motion
- **Icons chuyên nghiệp** từ Lucide React

## 🛠️ Công nghệ sử dụng

- **Frontend Framework**: React 18.2.0
- **Build Tool**: Vite 5.0.8
- **Styling**: Tailwind CSS 3.3.6
- **Icons**: Lucide React 0.293.0
- **Animations**: Framer Motion 10.16.16
- **HTTP Client**: Axios 1.6.2
- **Routing**: React Router DOM 6.21.1
- **Form Handling**: React Hook Form 7.48.2
- **Notifications**: React Hot Toast 2.4.1
- **State Management**: React Context API

## 📁 Cấu trúc thư mục

```
clinic_ui/
├── public/
│   ├── medical-icon.svg
│   └── index.html
├── src/
│   ├── components/
│   │   ├── ui/                    # UI Components cơ bản
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Badge.jsx
│   │   │   └── Loading.jsx
│   │   └── layout/                # Layout Components
│   │       ├── Header.jsx
│   │       ├── Footer.jsx
│   │       └── Layout.jsx
│   ├── pages/
│   │   ├── Home/                  # Trang chủ
│   │   ├── Auth/                  # Đăng nhập/Đăng ký
│   │   ├── Patient/               # Dashboard bệnh nhân
│   │   ├── Nurse/                 # Dashboard y tá
│   │   └── Doctor/                # Dashboard bác sĩ
│   ├── context/
│   │   └── AuthContext.jsx        # Context quản lý authentication
│   ├── services/
│   │   ├── api.js                 # Axios configuration
│   │   └── apiServices.js         # API endpoints
│   ├── hooks/
│   │   ├── useApi.js              # Custom hooks cho API
│   │   └── useStorage.js          # Custom hooks cho localStorage
│   ├── utils/
│   │   └── helpers.js             # Utility functions
│   ├── App.jsx                    # Main App component
│   ├── main.jsx                   # App entry point
│   └── index.css                  # Global styles
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## 🚀 Cài đặt và chạy dự án

### 1. Cài đặt dependencies

```bash
cd clinic_ui
npm install
```

### 2. Chạy development server

```bash
npm run dev
```

Ứng dụng sẽ chạy tại: [http://localhost:3000](http://localhost:3000)

### 3. Build cho production

```bash
npm run build
```

### 4. Preview build

```bash
npm run preview
```

## 🔧 Cấu hình

### API Configuration
Cấu hình API endpoint trong `src/services/api.js`:

```javascript
const API_BASE_URL = 'http://localhost:9000/api'
```

### Authentication
Ứng dụng sử dụng JWT token được lưu trong cookie và localStorage:

```javascript
// Cookie name
clinic_token

// LocalStorage keys
clinic_token
clinic_user
clinic_role
```

## 🎯 Workflow chính

### 1. Đăng ký bệnh nhân
1. Bệnh nhân điền form đăng ký
2. Upload avatar (tự động resize 156x156)
3. Xác thực email/phone
4. Tạo tài khoản thành công

### 2. Đăng ký dịch vụ khám bệnh
1. Chọn Category dịch vụ
2. Chọn Subcategory
3. Chọn Service cụ thể
4. Xác nhận thông tin
5. Thanh toán qua Stripe
6. Webhook xác nhận thanh toán
7. Thông báo đăng ký thành công

### 3. Quy trình y tá
1. Đăng nhập hệ thống
2. Xem danh sách dịch vụ đã đăng ký
3. Hỗ trợ bệnh nhân khám bệnh
4. Đánh dấu hoàn thành dịch vụ

## 🔐 Phân quyền

- **Patient**: Đăng ký dịch vụ, xem hồ sơ cá nhân
- **Nurse**: Quản lý dịch vụ, hỗ trợ bệnh nhân
- **Doctor**: Xem hồ sơ, quản lý lịch khám

## 🌟 Tính năng nâng cao

- **Responsive Design**: Tương thích mọi thiết bị
- **Progressive Web App**: Có thể cài đặt như ứng dụng native
- **Real-time Notifications**: Thông báo theo thời gian thực
- **Image Optimization**: Tự động resize và tối ưu ảnh
- **SEO Friendly**: Tối ưu cho công cụ tìm kiếm
- **Accessibility**: Tuân thủ chuẩn WCAG

## 📱 Screenshots

### Trang chủ
- Hero section với CTA rõ ràng
- Danh sách dịch vụ y tế
- Testimonials từ khách hàng
- Contact information

### Dashboard
- Overview thống kê
- Quick actions
- Recent activities
- Notifications panel

## 🤝 Đóng góp

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📄 License

Dự án này được phân phối dưới MIT License. Xem file `LICENSE` để biết thêm chi tiết.

## 📞 Liên hệ

- **Email**: info@medicare.vn
- **Phone**: 1900 1234
- **Address**: 123 Nguyễn Văn Cừ, Q1, TP.HCM

---

⭐ **Developed with ❤️ by MediCare Team**
