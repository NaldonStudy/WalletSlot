# 🤖 Android Studio Prebuild 가이드

## 📋 Prebuild 전 준비사항

### ✅ 필수 체크리스트
- [x] `app.json`에 Android 전용 설정 완료
- [x] Firebase 플러그인 설정 완료  
- [x] iOS 관련 코드 조건부 비활성화
- [ ] `google-services.json` 파일 준비 (Firebase Console에서 다운로드)

## 🚀 Prebuild 실행 단계

### **1단계: Firebase 설정 파일 배치**
```bash
# Firebase Console에서 다운로드한 파일을 루트에 배치
copy [다운로드한 google-services.json] C:\project\S13P21B108\Frontend\google-services.json
```

### **2단계: Prebuild 실행**
```bash
# Android 전용 prebuild
npx expo prebuild --platform android --clean

# 또는 전체 플랫폼 (iOS는 자동으로 스킵됨)
npx expo prebuild --clean
```

### **3단계: Android Studio에서 프로젝트 열기**
```bash
# Android Studio 실행 후
# File > Open > C:\project\S13P21B108\Frontend\android 폴더 선택
```

## 🔧 Android Studio 설정

### **필수 설정 사항**
1. **SDK 버전 확인**
   - Compile SDK: 34
   - Target SDK: 34
   - Min SDK: 21 (Expo 기본값)

2. **Firebase 설정 확인**
   - `android/app/google-services.json` 파일 존재 확인
   - `android/app/build.gradle`에 `apply plugin: 'com.google.gms.google-services'` 확인

3. **푸시 알림 권한 확인**
   - `android/app/src/main/AndroidManifest.xml`에서 권한 확인
   ```xml
   <uses-permission android:name="android.permission.INTERNET" />
   <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
   <uses-permission android:name="com.google.android.c2dm.permission.RECEIVE" />
   ```

## 🧪 테스트 실행

### **Development Build로 테스트**
```bash
# Android Studio에서 직접 빌드하거나
# 터미널에서 실행
cd android
./gradlew assembleDebug

# APK 설치
adb install app/build/outputs/apk/debug/app-debug.apk
```

### **Firebase 푸시 테스트**
1. APK 설치 후 앱 실행
2. 알림 화면에서 🚀 버튼 클릭
3. 콘솔에서 실제 FCM 토큰 확인
4. Firebase Console에서 직접 푸시 전송 테스트

## 🎯 주요 차이점

### **Expo Go vs Development Build**
```
📱 Expo Go (이전):
❌ Firebase 네이티브 모듈 없음
✅ Mock 모드로 시뮬레이션

🛠 Development Build (현재):
✅ 실제 Firebase FCM 토큰 발급
✅ 실제 푸시 알림 수신
✅ 네이티브 기능 모두 사용 가능
```

## 🔍 트러블슈팅

### **1. google-services.json 파일 없음**
```bash
Error: google-services.json not found
```
**해결책**: Firebase Console에서 파일 다운로드 후 루트 폴더에 배치

### **2. Gradle 빌드 실패**
```bash
Error: Could not resolve com.google.firebase
```
**해결책**: Android Studio에서 Gradle Sync 실행

### **3. FCM 토큰 발급 실패**
```bash
Error: Firebase not initialized
```
**해결책**: 
- `google-services.json` 파일 위치 확인
- 앱 재시작 후 다시 테스트

## 📱 배포 준비

### **릴리즈 빌드 생성**
```bash
# 릴리즈 APK 생성
cd android
./gradlew assembleRelease

# 결과물 위치
# android/app/build/outputs/apk/release/app-release.apk
```

### **Google Play Console 업로드**
1. 릴리즈 키스토어로 서명
2. AAB (Android App Bundle) 형태로 업로드 권장
3. Firebase SHA-1 릴리즈 인증서로 업데이트

## 🎉 완료 확인

### **성공적인 prebuild 확인 방법**
- [ ] `android/` 폴더 생성됨
- [ ] `android/app/google-services.json` 파일 존재
- [ ] Android Studio에서 프로젝트 열림 오류 없음
- [ ] 앱 빌드 및 설치 성공
- [ ] 실제 FCM 토큰 발급 확인
- [ ] 푸시 알림 정상 수신

이제 Android Studio에서 네이티브 Android 개발을 시작할 수 있습니다! 🚀