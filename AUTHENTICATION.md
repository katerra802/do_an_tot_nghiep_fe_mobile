# Authentication System Documentation

## Tổng quan

Hệ thống đăng nhập cho mobile app sử dụng JWT authentication với Backend API.

## Các file đã tạo

### 1. `types/index.ts`
- **User**: Interface cho thông tin user
- **LoginCredentials**: Username/password cho đăng nhập
- **LoginResponse**: Response từ API login
- **AuthState**: State quản lý authentication

### 2. `services/auth.service.ts`
Các chức năng:
- `login(credentials)`: Đăng nhập và lưu tokens vào AsyncStorage
- `logout()`: Đăng xuất và xóa tokens
- `getAccessToken()`: Lấy access token
- `getRefreshToken()`: Lấy refresh token
- `getCurrentUser()`: Lấy thông tin user hiện tại
- `isAuthenticated()`: Kiểm tra đã đăng nhập chưa
- `refreshToken()`: Refresh access token khi hết hạn
- `initializeAuth()`: Khởi tạo auth khi app start

### 3. `contexts/AuthContext.tsx`
React Context để quản lý global auth state:
- `user`: Thông tin user hiện tại
- `employeeId`: ID nhân viên (dùng cho các API calls)
- `isAuthenticated`: Trạng thái đăng nhập
- `isLoading`: Loading state
- `login(credentials)`: Function đăng nhập
- `logout()`: Function đăng xuất
- `refreshAuth()`: Reload auth state

### 4. `screens/LoginScreen.tsx`
Màn hình đăng nhập với:
- Form nhập username/password
- Loading state khi đăng nhập
- Error handling
- Auto navigate to tabs khi thành công

### 5. `screens/ProfileScreen.tsx`
Màn hình thông tin cá nhân:
- Hiển thị tên, email, role, employee ID
- Nút đăng xuất

### 6. `app/_layout.tsx`
- Wrap app với `<AuthProvider>`
- Thêm route `login`

### 7. `app/index.tsx`
Root index - redirect logic:
- Nếu chưa đăng nhập → `/login`
- Nếu đã đăng nhập → `/(tabs)`

### 8. `app/(tabs)/profile.tsx`
Tab mới cho profile/logout

## Cập nhật các screens

Tất cả screens (CareLog, DevelopmentLog, HarvestLog) đã được cập nhật:
- Import `useAuth` hook
- Lấy `employeeId` từ context thay vì hardcode
- Check authentication trước khi hiển thị
- Hiển thị message nếu chưa đăng nhập

## Flow hoạt động

### 1. App khởi động
```
App Start
  → AuthContext.initializeAuth()
  → Check AsyncStorage for token
  → If token exists: Set user state
  → app/index.tsx redirects based on isAuthenticated
```

### 2. Đăng nhập
```
User enters credentials
  → authService.login()
  → POST /auth/login
  → Save accessToken, refreshToken, user to AsyncStorage
  → Set token in axios header
  → Update AuthContext state
  → Navigate to /(tabs)
```

### 3. API Calls
```
Any API call
  → axios interceptor adds Authorization header
  → If 401: Try refresh token
  → If refresh fails: Logout and redirect to login
```

### 4. Đăng xuất
```
User clicks logout
  → authService.logout()
  → Remove tokens from AsyncStorage
  → Clear axios Authorization header
  → Clear AuthContext state
  → Navigate to /login
```

## Sử dụng trong components

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, employeeId, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <Text>Chưa đăng nhập</Text>;
  }
  
  // Use employeeId for API calls
  const loadData = async () => {
    const result = await myService.getByEmployee(employeeId);
  };
}
```

## Package mới

- `@react-native-async-storage/async-storage`: Lưu trữ tokens

## Backend Integration

Login endpoint: `POST http://localhost:3000/auth/login`
```json
{
  "username": "string",
  "password": "string"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token",
    "expiresIn": 10800000,
    "user": {
      "id": 1,
      "role": "admin",
      "name": "Nguyen Van A",
      "email": "user@example.com"
    }
  }
}
```

**Lưu ý**: `user.id` chính là `employee_id` để dùng cho các API calls khác.
