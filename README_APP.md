# Mobile App - Quản lý Vườn Chanh

App mobile được xây dựng với React Native (Expo) để quản lý vườn chanh với các tính năng chính:

## 🎯 Chức năng

### 1. Camera AI Detection (Real-time)
- Sử dụng camera để phát hiện bệnh cây real-time
- Kết nối với AI Model (Python FastAPI) qua WebSocket
- Chụp ảnh và phát hiện bệnh
- Hiển thị kết quả detection với ảnh đã được annotate
- Nút "Tạo báo cáo bệnh" khi phát hiện bệnh

### 2. Quản lý Nhật ký Bệnh (Disease Logs)
- Form nhập liệu báo cáo bệnh
- Hiển thị kết quả từ AI detection
- Lưu thông tin bệnh theo model `diseasesLog.model.ts`

### 3. Quản lý Nhật ký Chăm sóc (Care Logs)
- Danh sách nhật ký chăm sóc của nhân viên
- Form thêm/sửa nhật ký chăm sóc
- CRUD operations theo model `careLog.model.ts`

### 4. Quản lý Nhật ký Phát triển (Development Logs)
- Danh sách nhật ký phát triển
- Form thêm/sửa nhật ký phát triển
- CRUD operations theo model `developmentLog.model.ts`

### 5. Quản lý Nhật ký Thu hoạch (Harvest Logs)
- Danh sách nhật ký thu hoạch
- Form thêm/sửa nhật ký thu hoạch
- CRUD operations theo model `harvestLog.model.ts`

## 📁 Cấu trúc thư mục

```
Do_An_Tot_Nghiep_Mobile/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Tab navigation
│   │   ├── index.tsx             # Camera AI Screen (Tab 1)
│   │   ├── care-logs.tsx         # Care Log Screen (Tab 2)
│   │   ├── development-logs.tsx  # Development Log Screen (Tab 3)
│   │   └── harvest-logs.tsx      # Harvest Log Screen (Tab 4)
│   └── disease-log-form.tsx      # Form báo cáo bệnh (Modal/Stack)
├── screens/
│   ├── CameraAIScreen.tsx        # Màn hình camera + AI detection
│   ├── DiseaseLogFormScreen.tsx  # Form nhập disease log
│   ├── CareLogScreen.tsx         # Danh sách care logs
│   ├── DevelopmentLogScreen.tsx  # Danh sách development logs
│   └── HarvestLogScreen.tsx      # Danh sách harvest logs
├── services/
│   ├── api.config.ts             # Axios config cho BE và AI API
│   ├── ai.service.ts             # Service gọi AI Model API
│   ├── diseaseLog.service.ts     # Service CRUD disease logs
│   ├── careLog.service.ts        # Service CRUD care logs
│   ├── developmentLog.service.ts # Service CRUD development logs
│   └── harvestLog.service.ts     # Service CRUD harvest logs
└── types/
    └── index.ts                   # TypeScript types/interfaces
```

## 🚀 Cài đặt

### Bước 1: Cài đặt dependencies

```bash
cd Do_An_Tot_Nghiep_Mobile
npm install
```

### Bước 2: Cấu hình API URLs

Mở file `services/api.config.ts` và cập nhật URLs:

```typescript
export const API_CONFIG = {
  BACKEND_URL: 'http://YOUR_BACKEND_IP:3000/api', // Thay đổi theo IP của BE
  AI_URL: 'http://YOUR_AI_SERVER_IP:8000',        // Thay đổi theo IP của AI Model
};
```

**Lưu ý:** 
- Trên Android emulator: dùng `http://10.0.2.2:PORT`
- Trên iOS simulator: dùng `http://localhost:PORT`
- Trên thiết bị thật: dùng IP của máy tính trong cùng mạng

### Bước 3: Chạy app

```bash
# Start Expo
npm start

# Hoặc chạy trực tiếp trên platform
npm run android  # Android
npm run ios      # iOS
npm run web      # Web
```

## 🔌 Kết nối với Backend

### Backend API (Node.js/Express)

App sẽ gọi các endpoints sau (cần implement ở BE):

**Disease Logs:**
- `GET /api/diseases-log/employee/:employeeId` - Lấy danh sách theo nhân viên
- `GET /api/diseases-log/:id` - Lấy chi tiết
- `POST /api/diseases-log` - Tạo mới
- `PUT /api/diseases-log/:id` - Cập nhật
- `DELETE /api/diseases-log/:id` - Xóa

**Care Logs:**
- `GET /api/care-log/employee/:employeeId`
- `GET /api/care-log/:id`
- `POST /api/care-log`
- `PUT /api/care-log/:id`
- `DELETE /api/care-log/:id`

**Development Logs:**
- `GET /api/development-log/employee/:employeeId`
- `GET /api/development-log/:id`
- `POST /api/development-log`
- `PUT /api/development-log/:id`
- `DELETE /api/development-log/:id`

**Harvest Logs:**
- `GET /api/harvest-logs/employee/:employeeId`
- `GET /api/harvest-logs/:id`
- `POST /api/harvest-logs`
- `PUT /api/harvest-logs/:id`
- `DELETE /api/harvest-logs/:id`

### AI Model API (Python FastAPI)

App sẽ kết nối tới:

- `GET /` - Health check
- `POST /predict/image` - Phát hiện bệnh từ ảnh (base64)
- `WebSocket /predict-stream` - Real-time detection

## 📱 Sử dụng

### 1. Phát hiện bệnh bằng Camera
1. Mở app, tab "Camera AI" sẽ hiển thị
2. Cho phép quyền camera
3. Chọn "Chụp & Phát hiện" để chụp 1 ảnh và phát hiện
4. HOẶC chọn "Bật Real-time" để detection liên tục
5. Khi phát hiện bệnh, nhấn "Tạo báo cáo" để vào form nhập liệu

### 2. Quản lý Nhật ký
- Chuyển sang tab tương ứng (Chăm sóc / Phát triển / Thu hoạch)
- Xem danh sách nhật ký đã nhập
- Nhấn "+ Thêm mới" để tạo nhật ký mới
- Nhấn "Sửa" hoặc "Xóa" trên từng item

## 🔧 Cấu hình Camera Permissions

File `app.json` cần có:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Allow $(PRODUCT_NAME) to access your camera"
        }
      ]
    ],
    "ios": {
      "infoPlist": {
        "NSCameraUsageDescription": "This app uses the camera to detect plant diseases."
      }
    },
    "android": {
      "permissions": [
        "CAMERA"
      ]
    }
  }
}
```

## 🛠️ Development Tips

1. **Testing AI Connection:**
   ```typescript
   import { aiService } from '@/services/ai.service';
   
   const isHealthy = await aiService.checkHealth();
   console.log('AI Service:', isHealthy ? 'OK' : 'Failed');
   ```

2. **Mock Employee ID:**
   Hiện tại `EMPLOYEE_ID = 1` được hardcode. Sau này thay bằng:
   - Authentication system (JWT token)
   - AsyncStorage để lưu user info
   - Context API để share user state

3. **Error Handling:**
   Tất cả API services đều trả về `ApiResponse<T>` với:
   ```typescript
   {
     success: boolean;
     data?: T;
     message?: string;
     error?: string;
   }
   ```

## 📦 Dependencies chính

- `expo-camera` - Camera API
- `axios` - HTTP client
- `expo-router` - File-based routing
- `react-native-gesture-handler` - Gestures
- `expo-image-picker` - Chọn ảnh từ thư viện

## 🐛 Troubleshooting

**Camera không hoạt động:**
- Kiểm tra permissions trong settings
- Rebuild app sau khi thêm camera plugin

**Không kết nối được AI API:**
- Kiểm tra AI server đang chạy
- Kiểm tra URL và port đúng
- Trên Android emulator dùng `10.0.2.2` thay vì `localhost`

**WebSocket lỗi:**
- WebSocket URL phải dùng `ws://` không phải `http://`
- Kiểm tra CORS settings ở AI server

## 📝 TODO

- [ ] Implement authentication (login/logout)
- [ ] Implement form screens cho Care/Development/Harvest Logs
- [ ] Add image upload cho disease logs
- [ ] Add date picker components
- [ ] Add dropdown/picker cho các fields (plot_id, disease_id, etc.)
- [ ] Implement pagination cho danh sách
- [ ] Add pull-to-refresh
- [ ] Add loading states
- [ ] Error boundary
- [ ] Offline support với local storage

## 📄 License

Private project for graduation thesis.
