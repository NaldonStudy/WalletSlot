# 🔥 WalletSlot Firebase 설정 가이드

## 📋 설정 체크리스트

### ✅ Firebase Console 설정
- [ ] Firebase 프로젝트 생성: `walletslot`
- [ ] Android 앱 등록: `com.walletslot.app` (SHA-1 없이 등록 가능 ✅)
- [ ] iOS 앱 등록: `com.walletslot.app`
- [ ] Cloud Messaging API 활성화
- [ ] iOS APNs 키 업로드

### 🔐 디버그 서명 인증서 (SHA-1) 이해하기

#### 🤔 SHA-1이 뭔가요?
- **목적**: Google이 "이 앱이 진짜 당신 앱인지" 확인하는 디지털 신분증
- **비유**: 은행 거래할 때 보여주는 신분증과 같은 역할
- **현재 상황**: 푸시 알림만 사용한다면 **생략 가능** ✅

#### 📱 언제 필요한가요?
```
✅ 필요한 경우:
- Google Maps, Google Sign-In 사용할 때
- Google Play Console에 앱 업로드할 때
- 보안이 중요한 Firebase 기능 사용할 때

❌ 불필요한 경우 (현재 상황):
- FCM 푸시 알림만 사용
- 개발 단계에서 MSW로 시뮬레이션
- 아직 Google Play에 배포 안 함
```

#### 🛠 Windows에서 SHA-1 구하기 (자세한 단계)

**🔍 SHA-1이 정확히 뭔가요?**
- **디지털 지문**: 각 개발자의 컴퓨터마다 고유한 "서명" 
- **도장 개념**: 앱을 빌드할 때마다 자동으로 찍히는 "개발자 도장"
- **위치**: `C:\Users\[사용자명]\.android\debug.keystore` 파일 안에 저장
- **용도**: Google이 "진짜 개발자가 만든 앱"인지 확인하는 신분증

**💻 SHA-1 추출 방법:**

**1단계: PowerShell 관리자 모드로 실행**
```
Windows 키 + X → "Windows PowerShell (관리자)" 클릭
```

**2단계: keytool 명령어 실행**
```powershell
keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
```

**3단계: 결과에서 SHA-1 복사**
```
Certificate fingerprints:
     SHA1: A1:B2:C3:D4:E5:F6:G7:H8:I9:J0:K1:L2:M3:N4:O5:P6:Q7:R8:S9:T0
     SHA256: ...
```
↑ 이 SHA1 값을 Firebase에 입력

**🚨 만약 keytool을 찾을 수 없다는 에러가 나면:**
```powershell
# Java 경로 확인 후 실행
cd "C:\Program Files\Android\Android Studio\jre\bin"
.\keytool.exe -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
```

**4단계: Firebase Console에 SHA-1 입력**
```
1. Firebase Console > 프로젝트 설정
2. 내 앱 > Android 앱 선택  
3. "SHA 인증서 지문" 섹션에서 "추가" 클릭
4. 복사한 SHA-1 값 붙여넣기
```

### ✅ 파일 배치
- [ ] `google-services.json` → `android/app/`
- [ ] `GoogleService-Info.plist` → `ios/[ProjectName]/`

### 🔐 개발 vs 운영 키스토어 이해하기

#### 🛠 **디버그 키스토어** (지금 단계)
```
📍 위치: C:\Users\[사용자명]\.android\debug.keystore
🎯 용도: 개발/테스트 시 사용
🔄 특징: Android Studio가 자동 생성
⚠️ 한계: Google Play에 업로드 불가
```

#### 🚀 **릴리즈 키스토어** (운영 배포용)
```
📍 위치: 개발자가 직접 생성 및 보관
🎯 용도: Google Play Store 업로드
🔒 특징: 비밀번호로 보호, 분실 시 앱 업데이트 불가
✅ 필수: APK/AAB 배포 시 반드시 필요
```

#### 📋 **권장 설정 순서**
```
1. 지금: 디버그 SHA-1 등록 (개발/테스트용)
2. 나중에: 릴리즈 SHA-1 추가 (배포 직전)
3. Firebase에서 두 SHA-1 모두 등록 가능 ✅
```

### ✅ 코드 확인
- [x] FCM 토큰 등록 로직 구현됨
- [x] MSW 목업 API 구현됨
- [x] iOS APNs 토큰 처리 구현됨
- [x] 플랫폼별 알림 설정 구현됨

## � 중요한 에러 해결책

### **Expo Go 환경 제한 사항**

**에러 메시지:**
```
ERROR [Error: Native module RNFBAppModule not found]
ERROR expo-notifications: Android Push notifications functionality was removed from Expo Go with SDK 53
```

**해결책:** 두 가지 방법이 있습니다.

#### 🎯 **방법 1: 현재 코드로 Expo Go에서 테스트 (권장)**
- **현재 구현**: Firebase 모듈이 없으면 자동으로 Mock 모드로 전환
- **테스트 가능**: MSW 목업 API로 완전한 푸시 알림 플로우 시뮬레이션
- **장점**: 즉시 테스트 가능, 코드 변경 없음

#### 🔧 **방법 2: Development Build 생성**

**❗ 중요한 개념 정리:**

#### **Prebuild vs Expo Go 사용 가능성**
```
📱 iOS 상황:
✅ Prebuild 하지 않으면: Expo Go 계속 사용 가능
❌ Prebuild 하면: Expo Go 사용 불가, Development Build 필요

🤖 Android 상황:  
✅ Prebuild 하지 않으면: Expo Go 계속 사용 가능 (하지만 Firebase 제한)
❌ Prebuild 하면: Expo Go 사용 불가, Android Studio나 Development Build 필요
```

#### **Development Build 생성 방법**
```bash
# Android만 (현재 계획)
npx eas build --platform android --profile development

# iOS도 원한다면 (하지만 현재는 Android 중심)
npx eas build --platform ios --profile development
```

### �🚀 현재 상황에서 즉시 테스트 가능한 기능

#### **Expo Go 환경 (현재 권장)**
```javascript
// 콘솔에서 실행 가능 - Mock 모드로 동작
await initializePushService();  // Mock FCM 토큰 생성
await sendTestPush();          // MSW 시뮬레이션
getPushStatus();               // Mock 상태 확인
```

#### **알림 화면 UI 테스트**
- 🚀 버튼 클릭으로 Firebase 푸시 테스트 (Mock 모드)
- MSW가 실제 API 응답 시뮬레이션
- 로컬 알림으로 푸시 결과 확인

## 🔄 환경별 동작 방식

현재 코드는 **3단계 자동 환경 구분**을 지원합니다:

### 🎯 **Expo Go 환경** (현재 상황)
```
✅ Firebase 모듈 없음 → Mock 모드 자동 전환
✅ MSW 목업 API로 완전한 푸시 플로우 시뮬레이션  
✅ Mock FCM 토큰 생성 및 테스트
✅ 로컬 알림으로 결과 확인
```

### 🛠 **Development Build 환경**
```
✅ 실제 Firebase 모듈 로딩
✅ 진짜 FCM 토큰 발급
✅ MSW 시뮬레이션 + 실제 Firebase 연동
✅ 실제 푸시 알림 수신
```

### 🚀 **운영 환경** (__DEV__ = false)
```
✅ 실제 백엔드 API 호출
✅ Firebase Admin SDK로 실제 푸시 전송
✅ 모든 기능 실제 동작
```

## 📱 플랫폼별 차이점

### Android
- `google-services.json` 필요
- FCM 토큰만으로 푸시 가능
- 자동 배경 처리

### iOS  
- `GoogleService-Info.plist` + APNs 키 필요
- FCM + APNs 토큰 조합
- 포그라운드 알림 특별 처리

## 🎯 현재 코드의 장점

1. **단일 Firebase 프로젝트**: Dev/Prod 구분 없이 하나로 관리
2. **MSW 통합**: 백엔드 없이도 완전한 개발 가능
3. **자동 환경 전환**: 코드 변경 없이 운영 배포
4. **플랫폼 통합**: iOS/Android 차이를 서비스 레벨에서 처리

## 🔍 트러블슈팅

### **1. Expo Go에서 Firebase 에러**
```
ERROR [Error: Native module RNFBAppModule not found]
```
**해결책**: 정상적인 에러입니다. 코드가 자동으로 Mock 모드로 전환됩니다.
```javascript
// 콘솔에서 상태 확인 - Mock 모드로 동작함을 확인
getPushStatus();
```

### **2. Push notifications removed from Expo Go**
```
ERROR expo-notifications: Android Push notifications functionality was removed
```
**해결책**: Expo Go의 제한사항입니다. 현재 코드는 이를 우회하여 동작합니다.

### **3. Firebase 초기화 실패 시**
```javascript
// Mock 모드에서도 정상 동작 확인
await initializePushService();  // Mock FCM 토큰 생성됨
await sendTestPush();          // MSW 시뮬레이션 동작
```

### **4. Development Build에서 실제 Firebase 테스트**
- `google-services.json` 파일 위치 확인
- iOS: Xcode에서 Push Notifications Capability 활성화
- 실제 디바이스에서 테스트 (시뮬레이터는 APNs 미지원)