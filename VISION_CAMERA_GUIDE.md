# Hướng dẫn chuyển sang react-native-vision-camera

## ✅ Đã hoàn thành:

1. ✅ Cài đặt `react-native-vision-camera` và `react-native-worklets-core`
2. ✅ Cấu hình `app.json` với plugin và permissions
3. ✅ Tạo code mới với vision-camera (`CameraAIScreen.tsx`)
4. ✅ Prebuild thành công (tạo native android folder)

## 📋 Các file backup:

- `screens/CameraAIScreen.backup.tsx` - Code cũ dùng Expo Camera
- `screens/CameraAIScreen.vision.tsx` - Code mới dùng Vision Camera
- `screens/CameraAIScreen.tsx` - File đang dùng (vision camera version)

## 🚀 Bước tiếp theo - Chạy app:

### Cách 1: Tự động (dễ)
```bash
cd "c:\Users\Katera\Desktop\hoc_ki_1_nam_4\do_an_tot_nghiep\Do_An_Tot_Nghiep_Mobile"
npx expo run:android
```
**Lưu ý**: Nếu hỏi về port 8081, chọn Y để dùng port khác

### Cách 2: Build riêng rồi start metro (nếu cách 1 lỗi)
```bash
# Terminal 1: Start metro bundler
npx expo start --clear

# Terminal 2: Build và install app
cd android
./gradlew installDebug
```

## 🔄 Nếu muốn quay về Expo Camera cũ:

```bash
# 1. Restore file backup
Copy-Item "screens\CameraAIScreen.backup.tsx" "screens\CameraAIScreen.tsx" -Force

# 2. Xóa vision camera khỏi package.json
npm uninstall react-native-vision-camera react-native-worklets-core

# 3. Restore app.json (xóa plugin vision-camera)

# 4. Rebuild
npx expo prebuild --clean
npx expo run:android
```

## ⚙️ Sự khác biệt giữa 2 phiên bản:

### Expo Camera (cũ):
- ❌ Dùng `takePictureAsync()` → chụp ảnh thật → nháy màn hình
- ❌ WebSocket + interval 1.5s
- ✅ Đơn giản, không cần rebuild
- ✅ Chạy trên Expo Go

### Vision Camera (mới):
- ✅ Dùng `frameProcessor` → lấy frame từ preview → KHÔNG nháy
- ✅ Xử lý frame real-time (có thể 60 FPS)
- ✅ Native worklets → performance tốt hơn
- ❌ Phức tạp hơn, cần rebuild native
- ❌ KHÔNG chạy trên Expo Go

## 📱 Test thử:

1. Chạy app với vision camera version
2. Bật "Real-time Detection"
3. Quan sát:
   - ✅ Màn hình KHÔNG còn nháy (không còn tiếng chụp)
   - ✅ Frame được gửi mượt mà hơn
   - ✅ UI overlay hiển thị detection real-time

## 🐛 Nếu gặp lỗi:

### Lỗi build Android:
```bash
cd android
./gradlew clean
cd ..
npx expo prebuild --clean
npx expo run:android
```

### Lỗi permission:
- Check `app.json` có `"permissions": ["CAMERA"]` trong android section
- Xóa app trên điện thoại và cài lại

### Lỗi "frame.toBase64 is not a function":
- Vision camera version có thể khác
- Thử dùng `frame.toString()` thay vì `frame.toBase64()`

## 📊 So sánh Performance:

| Tính năng | Expo Camera | Vision Camera |
|-----------|-------------|---------------|
| Nháy màn hình | ✅ Có | ❌ Không |
| FPS | ~0.7 (1.5s/frame) | ~60 FPS |
| CPU usage | Thấp | Trung bình |
| Độ phức tạp | Đơn giản | Phức tạp |
| Expo Go | ✅ Yes | ❌ No |

## 🎯 Kết luận:

- **Nếu OK**: Vision camera tốt hơn rất nhiều, giữ lại
- **Nếu lỗi**: Quay về Expo Camera, vẫn hoạt động tốt

Good luck! 🚀
