# API ROUTES CẦN IMPLEMENT CHO BACKEND

## 📋 Tổng quan
Mobile app cần các API endpoints sau để hoạt động. Tất cả đều dùng base URL: `http://localhost:3000/api`

---

## 🔴 1. DISEASE LOGS API (Nhật ký bệnh)

### Base path: `/api/diseases-log`

| Method | Endpoint | Mô tả | Request Body | Response |
|--------|----------|-------|--------------|----------|
| **GET** | `/diseases-log/employee/:employeeId` | Lấy danh sách disease logs theo employee_id | - | `DiseaseLog[]` |
| **GET** | `/diseases-log/:id` | Lấy chi tiết 1 disease log | - | `DiseaseLog` |
| **GET** | `/diseases-log` | Lấy tất cả disease logs | - | `DiseaseLog[]` |
| **POST** | `/diseases-log` | Tạo mới disease log | `DiseaseLog` (không có id) | `DiseaseLog` |
| **PUT** | `/diseases-log/:id` | Cập nhật disease log | `Partial<DiseaseLog>` | `DiseaseLog` |
| **DELETE** | `/diseases-log/:id` | Xóa disease log (soft delete) | - | `{ message: string }` |

### DiseaseLog Model:
```typescript
{
  id?: number;
  disease_id: number;           // ID bệnh
  plant_plot_id: number;        // ID thửa cây trồng
  employee_ids: number;         // ID nhân viên phát hiện
  image_ids?: number[];         // Danh sách ID hình ảnh
  dateReport: Date | string;    // Ngày phát hiện
  notes?: string;               // Ghi chú
  isDeleted?: boolean;
  created_date?: Date | string | null;
  updated_date?: Date | string | null;
}
```

---

## 🟢 2. CARE LOGS API (Nhật ký chăm sóc)

### Base path: `/api/care-log`

| Method | Endpoint | Mô tả | Request Body | Response |
|--------|----------|-------|--------------|----------|
| **GET** | `/care-log/employee/:employeeId` | Lấy danh sách care logs theo employee_id | - | `CareLog[]` |
| **GET** | `/care-log/:id` | Lấy chi tiết 1 care log | - | `CareLog` |
| **GET** | `/care-log` | Lấy tất cả care logs | - | `CareLog[]` |
| **POST** | `/care-log` | Tạo mới care log | `CareLog` (không có id) | `CareLog` |
| **PUT** | `/care-log/:id` | Cập nhật care log | `Partial<CareLog>` | `CareLog` |
| **DELETE** | `/care-log/:id` | Xóa care log (soft delete) | - | `{ message: string }` |

### CareLog Model:
```typescript
{
  id?: number;
  plot_id: number;              // ID lô đất được chăm sóc
  employee_id: number;          // ID nhân viên thực hiện
  supply_ids?: number[];        // Danh sách ID vật tư sử dụng
  active: string[];             // Hoạt động chăm sóc
  notes?: string;               // Ghi chú
  dateReport: Date | string;    // Ngày thực hiện
  unit?: string;                // Đơn vị tính vật tư
  amount?: number;              // Số lượng vật tư
  weather?: string;             // Thời tiết
  isDeleted?: boolean;
  created_date?: Date | string | null;
  updated_date?: Date | string | null;
}
```

---

## 🔵 3. DEVELOPMENT LOGS API (Nhật ký phát triển)

### Base path: `/api/development-log`

| Method | Endpoint | Mô tả | Request Body | Response |
|--------|----------|-------|--------------|----------|
| **GET** | `/development-log/employee/:employeeId` | Lấy danh sách development logs theo employee_id | - | `DevelopmentLog[]` |
| **GET** | `/development-log/:id` | Lấy chi tiết 1 development log | - | `DevelopmentLog` |
| **GET** | `/development-log` | Lấy tất cả development logs | - | `DevelopmentLog[]` |
| **POST** | `/development-log` | Tạo mới development log | `DevelopmentLog` (không có id) | `DevelopmentLog` |
| **PUT** | `/development-log/:id` | Cập nhật development log | `Partial<DevelopmentLog>` | `DevelopmentLog` |
| **DELETE** | `/development-log/:id` | Xóa development log (soft delete) | - | `{ message: string }` |

### DevelopmentLog Model:
```typescript
{
  id?: number;
  plot_id: number;              // ID lô đất
  employee_id: number;          // ID nhân viên
  phaseDevelopment: string;     // Giai đoạn phát triển
  dateReport: Date | string;    // Ngày ghi chú
  notes?: string;               // Ghi chú
  isDeleted?: boolean;
  created_date?: Date | string | null;
  updated_date?: Date | string | null;
}
```

---

## 🟡 4. HARVEST LOGS API (Nhật ký thu hoạch)

### Base path: `/api/harvest-logs`

| Method | Endpoint | Mô tả | Request Body | Response |
|--------|----------|-------|--------------|----------|
| **GET** | `/harvest-logs/employee/:employeeId` | Lấy danh sách harvest logs theo employee_id | - | `HarvestLog[]` |
| **GET** | `/harvest-logs/:id` | Lấy chi tiết 1 harvest log | - | `HarvestLog` |
| **GET** | `/harvest-logs` | Lấy tất cả harvest logs | - | `HarvestLog[]` |
| **POST** | `/harvest-logs` | Tạo mới harvest log | `HarvestLog` (không có id) | `HarvestLog` |
| **PUT** | `/harvest-logs/:id` | Cập nhật harvest log | `Partial<HarvestLog>` | `HarvestLog` |
| **DELETE** | `/harvest-logs/:id` | Xóa harvest log (soft delete) | - | `{ message: string }` |

### HarvestLog Model:
```typescript
{
  id?: number;
  plot_id: number;              // ID của lô thu hoạch
  employee_id: number;          // ID của nhân viên
  dateReport: Date | string;    // Ngày thu hoạch
  quantity: number;             // Số lượng thu hoạch
  unit: string;                 // Đơn vị (kg, tấn, ...)
  notes?: string;               // Ghi chú
  isDeleted?: boolean;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
}
```

---

## 🎯 5. AI MODEL API (Python FastAPI - Optional Backend Proxy)

Nếu muốn proxy qua Backend thay vì gọi trực tiếp từ mobile:

### Base path: `/api/ai`

| Method | Endpoint | Mô tả | Request Body | Response |
|--------|----------|-------|--------------|----------|
| **POST** | `/ai/detect` | Proxy cho AI detection | `{ image: string }` (base64) | `AIDetectionResponse` |
| **GET** | `/ai/health` | Check AI service status | - | `{ status: 'ok' \| 'error' }` |

**Lưu ý:** Mobile app hiện đang gọi trực tiếp tới AI Model API (localhost:8000)

---

## 📝 Response Format Chuẩn

Tất cả API nên trả về format:

### Success Response:
```json
{
  "success": true,
  "data": { ... },
  "message": "Success message (optional)"
}
```

### Error Response:
```json
{
  "success": false,
  "error": "Error message",
  "message": "User-friendly error message"
}
```

---

## 🔐 Authentication (TODO)

Hiện tại chưa có authentication. Các endpoints cần thêm:

- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất  
- `GET /api/auth/me` - Lấy thông tin user hiện tại
- `POST /api/auth/refresh` - Refresh token

Headers cần thêm:
```
Authorization: Bearer <token>
```

---

## 🧪 Testing APIs

### Sử dụng cURL:

```bash
# Get care logs by employee
curl http://localhost:3000/api/care-log/employee/1

# Create new care log
curl -X POST http://localhost:3000/api/care-log \
  -H "Content-Type: application/json" \
  -d '{
    "plot_id": 1,
    "employee_id": 1,
    "active": ["Tưới nước", "Bón phân"],
    "dateReport": "2025-11-28",
    "notes": "Cây phát triển tốt"
  }'

# Delete disease log
curl -X DELETE http://localhost:3000/api/diseases-log/5
```

### Sử dụng Postman/Thunder Client:

Import collection với các endpoints trên.

---

## 📊 Database Relations

Các model có liên kết:
- `disease_id` → `diseases` table
- `plant_plot_id` → `plant_plots` table  
- `plot_id` → `plots` table
- `employee_id`, `employee_ids` → `employees` table
- `supply_ids` → `supplies` table
- `image_ids` → `media` table

Cần populate/join khi cần thiết (dùng `.populate()` với Mongoose).

---

## 🚀 Implementation Priority

1. **HIGH PRIORITY:**
   - Care Logs API (đã có model sẵn)
   - Development Logs API (đã có model sẵn)
   - Harvest Logs API (đã có model sẵn)

2. **MEDIUM PRIORITY:**
   - Disease Logs API (cần cho AI detection)

3. **LOW PRIORITY:**
   - AI Proxy API (mobile có thể gọi trực tiếp)
   - Authentication API

---

## 📌 Notes cho Backend Developer

1. **Validation:** Dùng Zod schema đã có sẵn trong `types/*.type.ts`
2. **Error Handling:** Wrap tất cả route trong try-catch
3. **Soft Delete:** Khi DELETE, chỉ set `isDeleted = true`, không xóa khỏi DB
4. **Timestamps:** Auto update `updated_date` khi PUT
5. **Employee Filter:** Endpoints `/employee/:employeeId` cần filter theo `employee_id`
6. **CORS:** Enable CORS cho mobile app (expo developer tools)

### Example CORS config:
```typescript
app.use(cors({
  origin: ['http://localhost:8081', 'exp://192.168.*.*:8081'],
  credentials: true
}));
```

---

## 📦 Mobile App Config

File `services/api.config.ts` có:
```typescript
export const API_CONFIG = {
  BACKEND_URL: 'http://localhost:3000/api',  // ← Đổi URL này
  AI_URL: 'http://localhost:8000',
};
```

Khi deploy production, update URLs này.

---

## ✅ Checklist Implementation

### Disease Logs
- [ ] GET `/diseases-log/employee/:employeeId`
- [ ] GET `/diseases-log/:id`
- [ ] GET `/diseases-log`
- [ ] POST `/diseases-log`
- [ ] PUT `/diseases-log/:id`
- [ ] DELETE `/diseases-log/:id`

### Care Logs  
- [ ] GET `/care-log/employee/:employeeId`
- [ ] GET `/care-log/:id`
- [ ] GET `/care-log`
- [ ] POST `/care-log`
- [ ] PUT `/care-log/:id`
- [ ] DELETE `/care-log/:id`

### Development Logs
- [ ] GET `/development-log/employee/:employeeId`
- [ ] GET `/development-log/:id`
- [ ] GET `/development-log`
- [ ] POST `/development-log`
- [ ] PUT `/development-log/:id`
- [ ] DELETE `/development-log/:id`

### Harvest Logs
- [ ] GET `/harvest-logs/employee/:employeeId`
- [ ] GET `/harvest-logs/:id`
- [ ] GET `/harvest-logs`
- [ ] POST `/harvest-logs`
- [ ] PUT `/harvest-logs/:id`
- [ ] DELETE `/harvest-logs/:id`

---

**Tổng cộng: 24 endpoints cần implement**
