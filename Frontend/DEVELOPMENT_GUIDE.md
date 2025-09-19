# WalletSlot 통합 개발 가이드 ver.3.0

> 본 문서는 2025-09-18 기준 최신 아키텍처 / 개발 규칙을 반영한 통합 개발 가이드입니다. Firebase v23 푸시 알림 시스템, MSW 통합 개발 환경, Android Prebuild 설정 등 모든 개발 정보를 하나의 문서로 통합했습니다.

## 📚 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [기술 스택](#2-기술-스택)
3. [개발 환경 설정](#3-개발-환경-설정)
4. [파일 구조 및 아키텍처](#4-파일-구조-및-아키텍처)
5. [Firebase 푸시 알림 시스템](#5-firebase-푸시-알림-시스템)
6. [MSW 개발 환경](#6-msw-개발-환경)
7. [Android 빌드 가이드](#7-android-빌드-가이드)
8. [핵심 설계 원칙](#8-핵심-설계-원칙)
9. [완성된 기능 현황](#9-완성된-기능-현황)
10. [트러블슈팅](#10-트러블슈팅)

## 1. 프로젝트 개요

WalletSlot은 개인 예산 관리와 계좌 연동을 통한 스마트 자금 관리 앱입니다. React Native + Expo 기반으로 개발되며, Firebase 푸시 알림, MSW 기반 개발 환경, TanStack Query를 활용한 서버 상태 관리를 특징으로 합니다.

## 2. 기술 스택

### 🏗️ 핵심 프레임워크
- **React Native**: 0.81.4 (최신 아키텍처 지원)
- **Expo**: ^54.0.7 (SDK 54, New Architecture 활성화)
- **React**: 19.1.0
- **TypeScript**: ~5.9.2 (엄격한 타입 체크)

### 🔄 상태 관리 & 네트워킹
- **TanStack Query**: ^5.87.4 (서버 상태 + Optimistic Updates)
- **Axios**: ^1.12.2 (HTTP 클라이언트 + 인터셉터)
- **Zustand**: ^5.0.8 (클라이언트 상태 관리)

### 🔔 푸시 알림 시스템 (Firebase v23)
- **@react-native-firebase/app**: ^23.3.1 (Firebase 코어, v23 호환)
- **@react-native-firebase/messaging**: ^23.3.1 (FCM, 함수 호출 방식)
- **expo-notifications**: ~0.32.11 (로컬 알림 + 권한 관리)

### 🎨 UI & 폼
- **react-hook-form**: ^7.62.0 + **@hookform/resolvers**: ^5.2.2
- **zod**: ^4.1.8 (스키마 검증)
- **victory-native**: ^41.20.1 (차트)
- **expo-linear-gradient**: ~15.0.7 (그라데이션)

### 🎭 개발 환경 (MSW)
- **MSW**: ^2.11.2 (React Native 네트워크 인터셉트)
- **@mswjs/interceptors**: ^0.39.6 (코어 인터셉터)
- **@faker-js/faker**: ^10.0.0 (Mock 데이터 생성)

### 🔧 폴리필 & 유틸리티
- **react-native-url-polyfill**: ^2.0.0 (URL 폴리필)
- **fast-text-encoding**: ^1.0.6 (TextEncoder/Decoder)
- **web-streams-polyfill**: ^4.2.0 (스트림 폴리필)
- **buffer**, **events**, **process**, **stream-browserify**, **util** (Node.js 호환)

### 📱 네이티브 기능
- **expo-device**: ~8.0.7 (디바이스 정보)
- **expo-constants**: ~18.0.8 (앱 설정)
- **expo-secure-store**: ~15.0.7 (보안 저장소)
- **react-native-gesture-handler**: ~2.28.0 (제스처)
- **react-native-reanimated**: ~4.1.0 (애니메이션)

## 3. 개발 환경 설정

### 🚀 빠른 시작

```bash
# 1. 의존성 설치
npm install

# 2. 개발 서버 시작 (Expo Go)
npm start

# 3. Android 빌드 (Development Build)
npm run android

# 4. iOS 빌드 (Development Build)
npm run ios
```

### 📱 환경별 개발 방식

#### **Expo Go 환경** (권장 - 빠른 개발)
```bash
npm start
# QR 코드 스캔으로 즉시 테스트
# Firebase → Mock 모드 자동 전환
# MSW로 완전한 API 시뮬레이션
```

#### **Development Build 환경** (실제 Firebase 테스트)
```bash
# Android Prebuild
npx expo prebuild --platform android --clean
npm run android

# iOS Prebuild (필요시)
npx expo prebuild --platform ios --clean
npm run ios
```

### 🔧 필수 설정 파일

#### **Firebase 설정**
```bash
# Android: google-services.json을 루트에 배치
# iOS: GoogleService-Info.plist을 ios/ 폴더에 배치
```

#### **환경 변수 (선택사항)**
```bash
# .env.local 생성 (gitignore에 포함됨)
EXPO_PUBLIC_API_URL=https://api.walletslot.com
EXPO_PUBLIC_MSW_ENABLED=true
```

---

## 4. 파일 구조 및 아키텍처

### 📁 프로젝트 구조 (2025-09-18 최신)

```
/                        # Frontend 루트 디렉토리 
├── index.js            # ✅ Firebase v23 백그라운드 핸들러 등록
├── app/                 # Expo 라우터 기반 화면 구성
│   ├── _dev/            # 🧪 개발용 컴포넌트 테스트 화면 그룹
│   ├── (auth)/          # 🔐 인증(로그인, 회원가입) 관련 화면 그룹
│   │   ├── _layout.tsx  # auth 레이아웃
│   │   └── (signup)/    # 회원가입 화면들
│   │       ├── _layout.tsx          # signup 레이아웃
│   │       ├── name.tsx             # ✅ 이름 입력 화면 (완전 구현)
│   │       ├── phone.tsx            # ✅ 전화번호 입력 화면 (완전 구현)
│   │       └── resident-id.tsx      # ✅ 주민등록 번호 입력 화면 (완전 구현)
│   ├── (linking)/       # 🔗 딥링킹, 외부 연동 관련 화면 그룹
│   ├── (onboarding)/    # 👋 온보딩(앱 최초 실행 시 안내) 화면 그룹
│   │   ├── _layout.tsx  # 온보딩 레이아웃
│   │   └── onboarding/  # 실제 온보딩 화면들
│   │       └── index.tsx   # ✅ 메인 온보딩 슬라이드 화면 (완전 구현)
│   ├── (tabs)/          # 📱 메인 탭 네비게이션 그룹
│   │   ├── _layout.tsx  # 4개 탭 설정 (대시보드, 리포트, 알림, 프로필)
│   │   ├── dashboard/   # 📊 대시보드 탭
│   │   │   └── index.tsx    # ✅ 메인 대시보드 화면 (완전 구현)
│   │   ├── report/      # 📈 리포트 탭
│   │   │   └── index.tsx    # 🚧 리포트 메인 화면 (플레이스홀더)
│   │   ├── notifications/ # 🔔 알림 탭
│   │   │   └── index.tsx    # ✅ 알림 목록 화면 (완전 구현)
│   │   └── profile/     # 👤 프로필 탭
│   │       └── index.tsx    # 🚧 프로필 설정 화면 (플레이스홀더)
│   ├── +not-found.tsx   # 404 에러 화면
│   ├── index.tsx        # ✅ 온보딩 상태 기반 라우팅 로직
│   └── _layout.tsx      # ✅ 앱 최상위 레이아웃 (푸시 알림 자동 초기화)
│
├── src/                 # 🎯 핵심 소스 코드 
│   ├── polyfills.ts     # ✅ MSW/React Native 폴리필 (최소 집합)
│   ├── mocks/           # 🎭 MSW Mock API 시스템 (완전 구현)
│   │   ├── index.ts     # ✅ MSW 초기화 및 isMSWEnabled() 유틸
│   │   ├── server.ts    # ✅ React Native용 MSW 서버 설정
│   │   ├── test.ts      # ✅ MSW 테스트 유틸리티 함수들
│   │   └── handlers/    # 도메인별 API Mock 핸들러
│   │       └── index.ts # 모든 핸들러 통합 파일
│   │
│   ├── api/             # 🌐 API 관련 로직
│   │   ├── client.ts    # ✅ Axios 인스턴스 + 인증 인터셉터
│   │   ├── queryKeys.ts # ✅ TanStack Query 키 중앙 관리
│   │   ├── queryClient.ts # ✅ Query 클라이언트 설정
│   │   ├── account.ts   # 🚧 계좌 관련 API 함수 (템플릿)
│   │   ├── auth.ts      # 🚧 인증 관련 API 함수 (템플릿)
│   │   ├── slot.ts      # 🚧 슬롯 관련 API 함수 (템플릿)
│   │   ├── notification.ts # ✅ 푸시 알림 API (완전 구현)
│   │   └── index.ts     # API 함수들 통합 export
│   │
│   ├── components/      # 🧩 커스텀 재사용 컴포넌트 (WalletSlot 전용)
│   │   ├── account/     # 💳 계좌 관련 컴포넌트들
│   │   │   ├── AccountCard.tsx      # ✅ 개별 계좌 카드 컴포넌트
│   │   │   ├── AccountCarousel.tsx  # ✅ 계좌 캐러셀 네비게이션
│   │   │   └── AccountSummary.tsx   # ✅ 계좌 요약 정보 컴포넌트
│   │   ├── chart/       # 📊 차트 관련 컴포넌트들
│   │   │   └── AccountDonutChart.tsx # ✅ 계좌별 슬롯 현황 도넛 차트
│   │   ├── common/      # 🔧 범용 컴포넌트 폴더
│   │   ├── slot/        # 🎯 슬롯 관련 컴포넌트들
│   │   │   └── UncategorizedSlotCard.tsx # ✅ 미분류 슬롯 카드
│   │   ├── Button.tsx   # ✅ 테마 기반 버튼 컴포넌트
│   │   ├── InputField.tsx # ✅ 폼 입력 필드 컴포넌트
│   │   ├── NotificationFilters.tsx # ✅ 알림 필터링 컴포넌트
│   │   ├── NotificationItem.tsx # ✅ 개별 알림 아이템 컴포넌트
│   │   └── index.ts     # 컴포넌트들 통합 export
│   │
│   ├── constants/       # 📋 앱 전역 상수
│   │   ├── api.ts       # 🌐 API 관련 상수 정의
│   │   ├── app.ts       # ⚙️ 앱 설정 상수
│   │   ├── banks.ts     # ✅ 은행 코드 및 로고 매핑 (17개 은행)
│   │   ├── Colors.ts    # 🎨 기본 색상 정의 (라이트/다크 모드)
│   │   ├── income.ts    # 💰 수입 관련 상수
│   │   ├── messages.ts  # 💬 메시지 템플릿 상수
│   │   ├── sampleData.ts # ✅ 개발용 샘플 데이터 (완전 구현)
│   │   ├── slots.ts     # ✅ 슬롯 카테고리 및 색상 매핑
│   │   ├── storage.ts   # 🗃️ 저장소 키 관리
│   │   ├── theme.ts     # ✅ 디자인 시스템 (완전 구현)
│   │   ├── ui.ts        # 🎯 UI 관련 상수
│   │   ├── validation.ts # ✅ 유효성 검사 상수
│   │   └── index.ts     # 상수들 통합 export
│   │
│   ├── hooks/           # 🪝 비즈니스 로직 커스텀 훅
│   │   ├── useAccount.ts # 🚧 계좌 데이터 관리 훅 (구조만 완성)
│   │   ├── useAuth.ts   # 🚧 인증 상태 관리 훅 (구조만 완성)
│   │   ├── useSlots.ts  # 🚧 슬롯 데이터 관리 훅 (구조만 완성)
│   │   ├── useNotifications.ts # ✅ 푸시 알림 TanStack Query 훅
│   │   ├── useNotificationLogic.ts # ✅ 알림 UI 로직 전용 훅
│   │   ├── useNotificationNavigation.ts # ✅ 알림 네비게이션 훅
│   │   ├── useTheme.ts  # 🎨 테마 관련 유틸리티 훅
│   │   └── index.ts     # 훅들 통합 export
│   │
│   ├── services/        # 🏢 비즈니스 로직 서비스 클래스
│   │   ├── firebasePushService.ts # ✅ Firebase v23 푸시 서비스 (완전 구현)
│   │   ├── unifiedPushService.ts # ✅ 통합 푸시 서비스 (완전 구현)
│   │   ├── localNotificationService.ts # ✅ 로컬 알림 서비스
|   |   ├── deviceIdService.ts # ✅ deviceId uuid 생성(완전 구현)
|   |   ├── authService.ts     # 🚧 계좌 데이터 관리 훅 (구조만 완성)
|   |   ├── appService.ts      # 🚧 계좌 데이터 관리 훅 (구조만 완성)
│   │   └── index.ts     # 서비스들 통합 export
│   │
│   ├── store/           # 🗄️ 데이터 저장소 및 클라이언트 상태 관리
│   │   ├── appStore.ts  # 🚧 Zustand 기반 전역 상태 (기본 구조)
│   │   ├── authStore.ts # 🚧 (Z + Async) 인증 상태 전용 스토어 (기본 구조)
│   │   ├── signupStore.ts  # ✅ Zustand 회원가입 데이터 임시 저장 (완전 구현)
│   │   └── index.ts     # ✅ SecureStore/AsyncStorage 래퍼 유틸
│   │
│   ├── types/           # 📝 전역 타입 정의
│   │   └── index.ts     # ✅ API 응답, 컴포넌트 props 등 핵심 타입
│   │
│   └── utils/           # 🔧 유틸리티 함수
│       └── index.ts     # 🚧 유틸리티 함수들 (기본 구조)
│
├── components/          # 🧱 Expo 기본 컴포넌트들
│   ├── ThemedText.tsx   # ✅ 테마 기반 텍스트 컴포넌트
│   ├── ThemedView.tsx   # ✅ 테마 기반 View 컴포넌트
│   └── ui/              # UI 관련 유틸리티 컴포넌트
│
├── hooks/               # 🪝 Expo 기본 훅들
│   ├── useColorScheme.ts    # ✅ 다크/라이트 모드 감지
│   └── useThemeColor.ts     # ✅ 테마 색상 조회 훅
│
├── assets/              # 📁 정적 파일
│   ├── fonts/           # 🔤 커스텀 폰트 파일
│   └── images/          # 🖼️ 앱 아이콘, 스플래시 이미지
│
├── android/             # 📱 Android 네이티브 프로젝트 (prebuild 후 생성)
├── ios/                 # 🍎 iOS 네이티브 프로젝트 (prebuild 후 생성)
├── google-services.json # 🔥 Firebase Android 설정 (Firebase Console에서 다운로드)
├── package.json         # ✅ 의존성 및 스크립트 정의
├── tsconfig.json        # ✅ TypeScript 설정 (`@/*` 절대경로)
├── app.json             # ✅ Expo 앱 설정 (Firebase 플러그인, 알림 권한)
├── metro.config.js      # ✅ Metro 번들러 설정 (MSW 최적화)
└── DEVELOPMENT_GUIDE.md # 📚 이 통합 개발 가이드
```

### 🏗️ 아키텍처 특징

- **파일 기반 라우팅**: Expo Router v6로 직관적인 네비게이션
- **층별 관심사 분리**: API → Services → Hooks → Components
- **MSW 통합**: 개발 환경에서 완전한 백엔드 시뮬레이션
- **Firebase v23 호환**: 최신 modular API 사용
- **TypeScript 엄격 모드**: 런타임 에러 최소화
- **폴리필 최소화**: 필수 요소만 포함하여 번들 크기 최적화

---

## 5. Firebase 푸시 알림 시스템

### 🔥 Firebase v23 완전 가이드

#### **핵심 변경사항 (v22 → v23)**
- **함수 호출 방식**: `messaging()` 함수로 호출 필수
- **자동 APNs 관리**: iOS APNs 토큰 자동 처리
- **Deprecated 메서드 제거**: 수동 등록 관련 메서드 정리

#### **시스템 아키텍처**
```typescript
index.js                    # 백그라운드 메시지 핸들러 등록
└── Firebase v23 함수 호출 방식

firebasePushService.ts      # Firebase 코어 서비스
├── initialize()            # 권한 요청 + FCM 토큰 발급
├── setupMessageListeners() # 포그라운드/백그라운드 처리
└── showLocalNotification()  # Expo Notifications 연동

unifiedPushService.ts       # 통합 인터페이스
└── Firebase + Local 알림 조율
```

### 📱 환경별 동작 방식

#### **🎯 Expo Go 환경** (권장 - 빠른 개발)
```
❌ Firebase 네이티브 모듈 없음
✅ 서비스가 자동으로 실패 처리
✅ MSW로 완전한 푸시 플로우 시뮬레이션
✅ 로컬 알림으로 결과 확인
```

#### **🛠 Development Build 환경** (실제 Firebase)
```
✅ 실제 Firebase FCM 토큰 발급
✅ 실제 푸시 알림 수신
✅ Firebase Console에서 직접 테스트 가능
✅ APNs 자동 관리 (iOS)
```

#### **🚀 운영 환경** (Production)
```
✅ 실제 백엔드 API 호출
✅ Firebase Admin SDK로 실제 푸시 전송
✅ 모든 기능 실제 동작
```

### 🔧 Firebase 설정 가이드

#### **1단계: Firebase Console 설정**
1. **프로젝트 생성**: `walletslot`
2. **Android 앱 등록**: `com.walletslot.app`
3. **iOS 앱 등록**: `com.walletslot.app` (선택사항)
4. **Cloud Messaging API 활성화**

#### **2단계: 설정 파일 배치**
```bash
# Android (필수)
google-services.json → 프로젝트 루트/

# iOS (선택사항)
GoogleService-Info.plist → ios/[ProjectName]/
```

#### **3단계: SHA-1 인증서 등록 (선택사항)**
푸시 알림만 사용하는 경우 **생략 가능**하지만, Google Services 사용 시 필요:

```powershell
# Windows PowerShell에서 실행
keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
```

결과에서 SHA1 값을 복사하여 Firebase Console → 프로젝트 설정 → SHA 인증서 지문에 추가

### 📋 코드 사용법

#### **앱 시작 시 자동 초기화**
```typescript
// app/_layout.tsx에서 자동 실행
useEffect(() => {
  if (onboardingDone) {
    unifiedPushService.initialize();
  }
}, [onboardingDone]);
```

#### **개발 환경에서 테스트**
```typescript
// 콘솔에서 실행 가능한 디버그 함수들 (__DEV__ 환경)
initializePushService();  // 푸시 서비스 초기화
getPushStatus();          // 현재 상태 확인
```

#### **MSW 환경에서 FCM 토큰 확인**
알림 화면에서 MSW 모드일 때만 FCM 토큰 디버그 섹션이 표시됩니다:
```typescript
// MSW 환경 체크
if (__DEV__ && isMSWEnabled()) {
  // FCM 토큰 표시
  const token = unifiedPushService.getFCMToken();
}
```

### 🔍 트러블슈팅

#### **Firebase 모듈 에러**
```
ERROR [Error: Native module RNFBAppModule not found]
```
**해결책**: Expo Go 환경의 정상적인 동작입니다. Mock 모드로 자동 전환됩니다.

#### **Push notifications removed from Expo Go**
```
ERROR expo-notifications: Android Push notifications functionality was removed
```
**해결책**: Expo Go의 제한사항입니다. Development Build 사용 권장.

#### **FCM 토큰 발급 실패**
```
ERROR Firebase not initialized
```
**해결책**: 
- `google-services.json` 파일 위치 확인
- Development Build에서 테스트
- Firebase Console 프로젝트 설정 확인

---

## 6. MSW 개발 환경

### 🎭 MSW (Mock Service Worker) 완전 가이드

WalletSlot은 백엔드 API가 준비되지 않은 상황에서도 완전한 개발이 가능하도록 MSW를 통합했습니다.

#### **핵심 특징**
- **실제 네트워크 요청 가로채기**: fetch, axios 코드 변경 없음
- **Faker.js 연동**: 실제와 유사한 한국어 Mock 데이터
- **조건부 활성화**: `__DEV__` 환경에서만 동작
- **최소 폴리필**: React Native 호환성 최적화

#### **MSW 시스템 구조**
```typescript
src/polyfills.ts           # React Native MSW 폴리필 (최소 집합)
├── Event, MessageEvent 등 필수 요소만

src/mocks/
├── index.ts              # MSW 초기화 및 isMSWEnabled()
├── server.ts             # React Native용 MSW 서버
├── test.ts               # MSW 연결 테스트 유틸리티
└── handlers/
    └── index.ts          # 도메인별 API Mock 핸들러
```

#### **사용법**

**자동 초기화**:
```typescript
// app/_layout.tsx에서 자동 실행
if (__DEV__) {
  initializeMSW();
}
```

**MSW 상태 확인**:
```typescript
import { isMSWEnabled } from '@/src/mocks';

// UI에서 조건부 렌더링
if (isMSWEnabled()) {
  // MSW 모드에서만 보이는 개발 도구
}
```

**API 호출 (코드 변경 없음)**:
```typescript
// 기존 API 호출 코드 그대로 사용
const response = await apiClient.get('/api/notifications');
// MSW가 자동으로 가로채서 Mock 데이터 반환
```

#### **Mock 데이터 예시**
```typescript
// 실제와 유사한 한국어 알림 데이터
{
  id: "ntf_001",
  title: "예산 초과 알림",
  body: "식비 예산의 90%를 사용했습니다",
  type: "budget_exceeded",
  isRead: false,
  createdAt: "2025-09-18T10:30:00Z"
}
```

#### **개발 도구**
```typescript
// 콘솔에서 사용 가능한 MSW 유틸리티
const { mswUtils } = await import('@/src/mocks');

mswUtils.test.connection();  // MSW 연결 테스트
mswUtils.test.showAPIs();    // 사용 가능한 API 목록
mswUtils.getStatus();        // MSW 현재 상태
```

---

## 7. Android 빌드 가이드

### 📱 Android Development Build 완전 가이드

Expo Go에서 실제 Firebase 기능을 테스트하려면 Development Build가 필요합니다.

#### **빌드 전 준비사항**

**필수 체크리스트**:
- [x] `app.json`에 Android 설정 완료
- [x] Firebase 플러그인 설정 완료
- [ ] `google-services.json` 파일 배치

#### **1단계: Firebase 설정 파일 배치**
```bash
# Firebase Console에서 다운로드한 파일을 루트에 배치
copy [다운로드한파일] google-services.json
```

#### **2단계: Prebuild 실행**
```bash
# Android 전용 prebuild (권장)
npx expo prebuild --platform android --clean

# 또는 전체 플랫폼
npx expo prebuild --clean
```

#### **3단계: Android Studio 빌드**
```bash
# Android Studio에서 빌드하거나
cd android
./gradlew assembleDebug

# APK 설치
adb install app/build/outputs/apk/debug/app-debug.apk
```

#### **4단계: 실제 Firebase 테스트**
1. APK 설치 후 앱 실행
2. 알림 화면에서 FCM 토큰 확인
3. Firebase Console → Cloud Messaging → 테스트 메시지에서 토큰 입력
4. 푸시 알림 전송 테스트

### 🔧 Android Studio 설정

#### **필수 설정**
- **Compile SDK**: 34
- **Target SDK**: 34  
- **Min SDK**: 21

#### **Firebase 설정 확인**
- `android/app/google-services.json` 파일 존재
- `android/app/build.gradle`에 `apply plugin: 'com.google.gms.google-services'` 확인

#### **권한 확인**
```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
<uses-permission android:name="com.google.android.c2dm.permission.RECEIVE" />
```

### 🚀 배포 준비

#### **릴리즈 빌드**
```bash
cd android
./gradlew assembleRelease
# 결과: android/app/build/outputs/apk/release/app-release.apk
```

#### **Google Play Console 업로드**
1. 릴리즈 키스토어로 서명 필요
2. AAB (Android App Bundle) 형태 권장
3. Firebase에 릴리즈 SHA-1 인증서 추가

---

## 8. 핵심 설계 원칙

### 8.1 환경별 자동 전환 아키텍처
- **Expo Go**: Firebase 모듈 부재 시 자동 Mock 모드 전환
- **Development Build**: 실제 Firebase + MSW API 시뮬레이션 병행
- **Production**: 실제 백엔드 API + Firebase Admin SDK 완전 연동

### 8.2 Firebase v23 호환성 우선
- **함수 호출 방식**: `messaging()` 함수로 일관된 호출
- **Deprecated 메서드 제거**: 수동 APNs 등록 등 제거
- **자동 플랫폼 처리**: iOS/Android 차이를 서비스 레벨에서 흡수

### 8.3 MSW 통합 개발 환경
- **실제 네트워크 요청**: fetch/axios 코드 변경 없이 Mock 데이터 제공
- **최소 폴리필**: React Native 필수 요소만 포함하여 성능 최적화
- **조건부 UI**: `isMSWEnabled()`로 개발/운영 환경 구분

### 8.4 Optimistic UI & TanStack Query
- **즉시 UI 반영**: 서버 응답 전에 UI 먼저 업데이트
- **자동 롤백**: 서버 에러 시 이전 상태로 자동 복구
- **최소 무효화**: 관련 캐시만 선택적으로 새로고침

### 8.5 TypeScript 엄격 모드
- **런타임 에러 방지**: 컴파일 시점에 타입 에러 감지
- **API 응답 타입**: 서버/Mock 응답 모두 동일한 타입 보장
- **프롭스 안전성**: 컴포넌트 간 데이터 전달 시 타입 체크

### 8.6 성능 최적화 전략
- **React.memo**: 불필요한 리렌더링 방지
- **useMemo/useCallback**: 연산 비용 최소화
- **FlatList 최적화**: 대용량 리스트 성능 향상
- **번들 크기 최적화**: 필요한 폴리필만 포함

### 8.7 개발자 경험(DX) 최우선
- **핫 리로드**: 코드 변경 시 즉시 반영
- **디버그 함수**: 콘솔에서 바로 사용 가능한 테스트 도구
- **로깅 표준**: `[FIREBASE_PUSH]`, `[UNIFIED_PUSH]` 등 명확한 로그 프리픽스

### 8.8 점진적 기능 확장
- **코어 → 확장**: 핵심 기능 완성 후 부가 기능 추가
- **하위 호환성**: 기존 API 구조 유지하며 새 기능 추가
- **Feature Flag**: 새 기능을 안전하게 테스트할 수 있는 토글 제공

---

## 9. 완성된 기능 현황

### 🏗️ 기본 프로젝트 설정 (완료)

- ✅ **Expo + TypeScript 환경**: React Native 0.81.4, Expo SDK 54.0.7
- ✅ **절대 경로 설정**: `@/*` 매핑으로 깔끔한 import
- ✅ **파일 기반 라우팅**: Expo Router v6 그룹 라우팅
- ✅ **온보딩 시스템**: AsyncStorage 기반 완료 상태 관리
- ✅ **New Architecture**: Expo 54에서 활성화

### 🔔 Firebase 푸시 알림 시스템 (완료)
- ✅ **Firebase v23 호환**: 함수 호출 방식으로 완전 업그레이드
- ✅ **환경별 자동 전환**: Expo Go(Mock) ↔ Development Build(실제)
- ✅ **통합 서비스 아키텍처**: unifiedPushService로 모든 푸시 기능 관리
- ✅ **백그라운드 핸들러**: index.js에서 앱 종료 상태 알림 처리
- ✅ **Deprecated 메서드 정리**: v23에서 제거된 기능들 모두 정리
- ✅ **권한 요청 플로우**: Expo Notifications + Firebase 조합
- ✅ **플랫폼별 최적화**: iOS APNs 자동 관리, Android 채널 설정

### 🎭 MSW 개발 환경 (완료)
- ✅ **React Native MSW**: 실제 네트워크 요청 가로채기
- ✅ **최소 폴리필**: 필수 요소만 포함하여 성능 최적화
- ✅ **Faker.js 연동**: 실제와 유사한 한국어 Mock 데이터
- ✅ **조건부 UI**: isMSWEnabled()로 개발/운영 환경 구분
- ✅ **자동 초기화**: __DEV__ 환경에서 자동 활성화
- ✅ **테스트 유틸리티**: MSW 연결 상태 확인 도구

### 🎨 디자인 시스템
**`src/constants/theme.ts` - ✅ 기본 동작 완료**
- `Colors`: 50단계 색상 팔레트 (primary, secondary, gray 등), 슬롯 카테고리별 색상, 라이트/다크 모드 색상
- `Typography`: 폰트 크기(xs~6xl), 폰트 두께(light~extrabold), 줄 간격 등
- `Spacing`: 4px~96px 간격 시스템 (`xs`, `sm`, `base` 등)
- `BorderRadius`, `Shadows`: UI 컴포넌트용 스타일 토큰
- `themes` 객체: 라이트/다크 테마 자동 전환 지원
- **개선 필요**: 접근성 고려한 색상 대비, 반응형 간격, 더 다양한 컴포넌트 상태별 색상

**재사용 컴포넌트 - 🔧 기본 기능 완료, 개선 필요**
- **`src/components/Button.tsx`**: 
  - Props: `variant`(primary/secondary/outline/ghost/danger), `size`(sm/md/lg), `loading`, `disabled` 등
  - 기능: 테마 기반 자동 색상 변경, 로딩 스피너, 접근성 지원
  - **개선 필요**: 애니메이션, 햅틱 피드백, 다양한 아이콘 지원, 더 많은 변형
- **`src/components/InputField.tsx`**: 
  - Props: `label`, `error`, `helperText`, `required`, `leftElement`, `rightElement` 등
  - 기능: 포커스 상태 관리, 에러 표시, 좌우 아이콘 지원
  - **개선 필요**: 다양한 입력 타입(숫자, 전화번호), 실시간 유효성 검사, 자동완성

**계좌 관련 컴포넌트 - ✅ 완전 구현됨**
- **`src/components/account/AccountSummary.tsx`**:
  - Props: `account` (bankCode, accountName, accountNumber, balanceFormatted)
  - 기능: 은행 로고 표시, 로딩 인디케이터, 이미지 캐싱, 테마 기반 색상, 메모이제이션
  - 최적화: React.memo로 불필요한 리렌더링 방지, expo-image로 성능 향상
- **`src/components/account/AccountCarousel.tsx`**:
  - 기능: 계좌 간 스와이프 네비게이션, 인덱스 변경 알림, 테마 대응
  - 통합: dashboard 화면에서 AccountSummary와 연동하여 선택된 계좌 정보 표시
- **`src/components/chart/AccountDonutChart.tsx`**:
  - Props: `data` (SlotData 배열로 예산/잔액/색상 정보)
  - 기능: SVG 기반 도넛 차트, 슬롯별 사용률 시각화, 동적 범례, 애니메이션 지원
  - 최적화: 극좌표 변환, 각도 계산, 메모이제이션으로 리렌더링 최소화
- **`src/components/slot/UncategorizedSlotCard.tsx`**:
  - 기능: 미분류 슬롯 잔액 표시, 읽지 않은 알림 배지
  - UI: 그라데이션 배경, 둥근 모서리, 그림자 효과

**상수 및 데이터 관리 - ✅ 완전 구현됨**
- **`src/constants/banks.ts`**: 17개 주요 은행 코드, 로고, 색상 매핑 (한국은행~카카오뱅크, 싸피은행)
- **`src/constants/sampleData.ts`**: 실제 운영과 유사한 계좌/슬롯 샘플 데이터, SLOT_CATEGORIES 연동
- **`src/constants/slots.ts`**: 슬롯 카테고리별 라벨, 색상, 아이콘 정의

### 🌐 API 통신 인프라 (완료)
- ✅ **Axios 클라이언트**: 인증 인터셉터, 401 에러 자동 처리
- ✅ **TanStack Query 통합**: 캐시, 무효화, Optimistic Updates
- ✅ **쿼리 키 관리**: 중앙집중식 쿼리 키 관리 시스템
- ✅ **알림 API**: 완전한 CRUD + Optimistic UI 구현
- 🚧 **계좌/슬롯 API**: 기본 구조만 완성 (실제 구현 대기)

**`src/api/queryKeys.ts` - ✅ 구조 + 안정화 (변경됨)**
> **역할**: TanStack Query의 캐시 키를 중앙에서 관리하여 데이터 무효화와 재조회를 체계적으로 처리
```typescript
export const queryKeys = {
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    devices: () => [...queryKeys.user.all, 'devices'] as const,
  },
  accounts: {
    all: ['accounts'] as const,
    linked: () => [...queryKeys.accounts.all, 'linked'] as const,
    available: () => [...queryKeys.accounts.all, 'available'] as const,
    detail: (accountId: number) => [...queryKeys.accounts.all, 'detail', accountId] as const,
    balance: (accountId: number) => [...queryKeys.accounts.all, 'balance', accountId] as const,
    transactions: (accountId: number, filters?: any) => [...queryKeys.accounts.all, 'transactions', accountId, filters] as const,
  },
  slots: {
    all: ['slots'] as const,
    list: () => [...queryKeys.slots.all, 'list'] as const,
    detail: (id: number) => [...queryKeys.slots.all, 'detail', id] as const,
    recommendations: () => [...queryKeys.slots.all, 'recommendations'] as const,
    byAccount: (accountId: number) => [...queryKeys.slots.all, 'byAccount', accountId] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: (params?: any) => {
      if (!params) return [...queryKeys.notifications.all, 'list'] as const;
      const norm: Record<string, any> = {};
      if (params.page != null) norm.page = params.page;
      if (params.limit != null) norm.limit = params.limit;
      if (params.unreadOnly) norm.unreadOnly = true;
      if (params.type && params.type !== 'all') norm.type = params.type;
      return [...queryKeys.notifications.all, 'list', norm] as const;
    },
    detail: (id: string) => [...queryKeys.notifications.all, 'detail', id] as const,
    unreadCount: () => [...queryKeys.notifications.all, 'unreadCount'] as const,
    settings: () => [...queryKeys.notifications.all, 'settings'] as const,
  },
} as const;
```
**사용 예시**: `queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all })` → 모든 계좌 데이터 새로고침

**API 함수 템플릿 - 📝 기본 구조만 (알림 제외)**
> **역할**: 백엔드 API와 통신하는 함수들의 기본 틀을 제공하여 일관된 API 호출 패턴 유지
- **`src/api/auth.ts`**: 
  - `login(email, password)`: 사용자 로그인 후 토큰 반환 (실제 API 호출 코드는 주석 처리)
  - `register(userData)`: 회원가입 처리 (현재는 mock 데이터 반환)
  - `logout()`: 로그아웃 및 토큰 무효화 처리
- **`src/api/account.ts`**: 
  - `getLinkedAccounts()`: 연결된 은행 계좌 목록 조회
  - `getAccountBalance(accountId)`: 특정 계좌의 현재 잔액 조회
  - `getTransactions(accountId, filters)`: 계좌별 거래내역 조회 (날짜, 카테고리 필터링 가능)
- **`src/api/slot.ts`**: 
  - `getUserSlots()`: 사용자가 생성한 모든 슬롯 목록 조회
  - `getSlotDetail(slotId)`: 특정 슬롯의 상세 정보 및 지출 현황 조회
  - `getSlotRecommendations()`: AI 기반 슬롯 생성 추천 데이터 조회
**`src/api/notification.ts` - ✅ 고도화 구현 (정규화 + Fallback + Optimistic 연동)**
  - `getNotifications(params)`: Normalizer 통해 Pagination 표준화. Ambiguous 응답 시 **조건부 Fallback fetch**.
  - `getUnreadCount()`: 단순 카운트 + Optimistic 패치 대상.
  - `markAsRead / markAsUnread / markAllAsRead / delete / create`: 서버 확정 전 Optimistic 캐시 반영.
  - `createNotification / pullNotifications / markAsDelivered`: 알림 생성 및 전송 관리.
  - `getSettings / updateSettings`: 설정 CRUD.
  - `sendTestNotification`: 개발용 테스트 알림 전송.
  - 내부 전략: `isAmbiguousAxiosBody()` → `fetchNotificationsFallback()` → `normalizeNotificationList()` 순.
  - 모든 함수에 `[NOTIF_API]` 로깅 프리픽스 적용.

**현재 상태**: 모든 함수가 TypeScript 타입과 함께 정의되어 있으나, 알림 API를 제외하고는 실제 API 호출 로직이 주석 처리되어 있고 mock 데이터 반환

### 🧪 테스트 & 개발 도구 (완료)
- ✅ **MSW 테스트 유틸리티**: 연결 상태, API 목록 확인
- ✅ **디버그 함수**: 콘솔에서 바로 사용 가능한 푸시 서비스 테스트
- ✅ **온보딩 리셋**: 개발 환경에서 온보딩 상태 초기화
- ✅ **로깅 시스템**: `[FIREBASE_PUSH]`, `[UNIFIED_PUSH]` 등 명확한 프리픽스
- ✅ **에러 처리**: 환경별 자동 fallback, Graceful degradation

---

## 10. 트러블슈팅

### 🔥 Firebase 관련 문제

#### **"Native module RNFBAppModule not found"**
```
ERROR [Error: Native module RNFBAppModule not found]
```
**원인**: Expo Go 환경에서는 Firebase 네이티브 모듈 사용 불가  
**해결책**: 정상적인 에러입니다. 코드가 자동으로 Mock 모드로 전환됩니다.

#### **"Push notifications removed from Expo Go"** 
```
ERROR expo-notifications: Android Push notifications functionality was removed
```
**원인**: Expo Go SDK 53부터 푸시 알림 기능 제거  
**해결책**: Development Build 사용 권장. 현재 코드는 이를 우회 처리합니다.

#### **FCM 토큰 발급 실패**
```
ERROR Firebase not initialized
```
**해결책**:
1. `google-services.json` 파일이 루트에 있는지 확인
2. Development Build에서 테스트
3. Firebase Console 프로젝트 설정 확인

### 🎭 MSW 관련 문제

#### **MSW 초기화 실패**
```
ERROR MSW 초기화 실패
```
**해결책**:
1. `react-native-url-polyfill/auto` import 확인
2. 폴리필 로딩 순서 확인 (최상단에 위치)
3. `__DEV__` 환경인지 확인

#### **네트워크 요청이 가로채지지 않음**
**해결책**:
1. MSW 서버가 시작되었는지 확인: `mswUtils.test.connection()`
2. 핸들러가 올바르게 등록되었는지 확인
3. 요청 URL이 핸들러 패턴과 일치하는지 확인

### 📱 Android 빌드 문제

#### **google-services.json not found**
**해결책**: Firebase Console에서 파일 다운로드 후 루트 폴더에 배치

#### **Gradle 빌드 실패**
```
ERROR Could not resolve com.google.firebase
```
**해결책**: Android Studio에서 Gradle Sync 실행

#### **Prebuild 후 Expo Go 사용 불가**
**원인**: prebuild 후 네이티브 코드 생성되면 Expo Go 호환성 제거  
**해결책**: Development Build 사용하거나 `expo install --fix` 실행

### 🚀 성능 관련 문제

#### **앱 시작 시간 지연**
**해결책**:
1. 폴리필 최소화 (현재 구현됨)
2. MSW 초기화를 비동기로 처리 (현재 구현됨)
3. 불필요한 import 제거

#### **메모리 사용량 증가**
**해결책**:
1. React.memo 사용 (현재 구현됨)
2. FlatList `removeClippedSubviews` 옵션 활용
3. 큰 이미지는 expo-image 사용

### 🔍 디버깅 도구

#### **콘솔에서 사용 가능한 디버그 함수들**
```javascript
// 푸시 서비스 관련
initializePushService()    // 푸시 서비스 초기화
getPushStatus()           // 현재 상태 확인

// 온보딩 관련  
resetOnboarding()         // 온보딩 상태 리셋
completeOnboarding()      // 온보딩 완료 처리
checkOnboardingStatus()   // 현재 온보딩 상태 확인

// MSW 관련
mswUtils.test.connection() // MSW 연결 테스트
mswUtils.test.showAPIs()   // 사용 가능한 API 목록
mswUtils.getStatus()       // MSW 현재 상태
```

#### **로그 모니터링**
```javascript
// Firebase 관련 로그
[FIREBASE_PUSH] ...

// 통합 푸시 서비스 로그  
[UNIFIED_PUSH] ...

// MSW 관련 로그
MSW가 활성화되어 있습니다 ...
```

---

## 📚 추가 학습 자료

### 🔗 공식 문서
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Firebase](https://rnfirebase.io/)
- [TanStack Query](https://tanstack.com/query/latest)
- [MSW (Mock Service Worker)](https://mswjs.io/)

### 🛠️ 개발 도구
- [Firebase Console](https://console.firebase.google.com/)
- [Expo Dev Tools](https://expo.dev/)
- [React Native Debugger](https://github.com/jhen0409/react-native-debugger)

### 📖 프로젝트별 가이드
- Firebase v23 Migration Guide
- MSW React Native 설정 가이드  
- Expo Development Build 가이드

---

## 📝 마무리

이 통합 개발 가이드는 WalletSlot 프로젝트의 모든 개발 정보를 하나의 문서로 정리했습니다. Firebase v23 푸시 알림 시스템부터 MSW 개발 환경, Android 빌드까지 실제 개발에 필요한 모든 내용을 포함하고 있습니다.

**주요 특징:**
- ✅ 환경별 자동 전환 (Expo Go ↔ Development Build)
- ✅ Firebase v23 완전 호환
- ✅ MSW 통합 개발 환경  
- ✅ TypeScript 엄격 모드
- ✅ Optimistic UI 패턴
- ✅ 성능 최적화 적용

**개발 시작:**
```bash
npm install
npm start
# QR 코드로 Expo Go에서 즉시 테스트 가능
```

문제가 발생하면 [트러블슈팅](#10-트러블슈팅) 섹션을 참고하거나, 콘솔의 디버그 함수들을 활용해 보세요.
> **역할**: 인증 관련 상태와 로직을 컴포넌트에서 쉽게 사용할 수 있도록 캡슐화
```typescript
export const useAuth = () => {
  const queryClient = useQueryClient();
  
  // TODO: 실제 상태 관리 연결 필요
  const user: User | null = null;
  const isLoading = false;

  // 로그인 뮤테이션
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      const { user, tokens } = response.data;
      // TODO: 상태 관리에 저장
      console.log('Login success:', user);
    },
  });

  // 로그아웃 (상태 초기화)
  const logout = () => {
    // TODO: 상태 초기화
    queryClient.clear(); // 모든 캐시 데이터 삭제
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login: loginMutation.mutate,
    isLoginLoading: loginMutation.isPending,
    logout,
    hasPermission: (permission: string) => !!user,
  };
};
```
**현재 상태**: TanStack Query 기반 뮤테이션 구조는 완성, 실제 상태 관리와 토큰 저장 로직은 TODO

**`src/hooks/useAccount.ts` - 🔧 useQuery 구조만 완성**
> **역할**: 계좌 관련 데이터를 TanStack Query를 통해 캐싱하고 자동 업데이트 관리
```typescript
export const useLinkedAccounts = () => useQuery({ 
  queryKey: queryKeys.accounts.all, 
  queryFn: accountApi.getLinkedAccounts,  // ← 이 함수는 구현됨 (mock 데이터 반환)
  staleTime: 5 * 60 * 1000,             // 5분간 캐시 유지
  // 사용자의 연결된 모든 은행 계좌 목록을 조회하여 대시보드에 표시
})

export const useAccountBalance = (accountId: string) => useQuery({
  queryKey: queryKeys.accounts.detail(accountId),
  queryFn: () => accountApi.getAccountBalance(accountId),
  enabled: !!accountId,  // accountId가 있을 때만 실행
  // 특정 계좌의 실시간 잔액 정보 조회 (새로고침 시 최신 데이터 표시)
})

export const useTransactions = (accountId: string, filters?: TransactionFilters) => useQuery({
  queryKey: queryKeys.accounts.transactions(accountId),
  queryFn: () => accountApi.getTransactions(accountId, filters),
  // 거래내역을 페이지네이션과 필터링으로 조회 (카테고리별, 날짜별 등)
})
```
**현재 상태**: TanStack Query 구조는 완전히 구현되어 있으나, API 함수들이 실제 서버 대신 mock 데이터 반환

**`src/hooks/useSlots.ts` - 📝 기본 구조만 완성**
> **역할**: 슬롯(예산 카테고리) 관련 데이터 조회 및 관리 로직을 캡슐화
```typescript
export const useSlots = () => useQuery({
  queryKey: queryKeys.slots.all,
  queryFn: slotApi.getUserSlots,
  // 사용자가 생성한 모든 슬롯 목록 조회 (식비, 교통비, 쇼핑 등)
  // 각 슬롯의 예산, 현재 사용 금액, 진행률 등 포함
})

export const useSlot = (slotId: string) => useQuery({
  queryKey: queryKeys.slots.detail(slotId), 
  queryFn: () => slotApi.getSlotDetail(slotId),
  enabled: !!slotId,
  // 특정 슬롯의 상세 정보: 거래내역, 예산 히스토리, 목표 달성률 등
})

export const useSlotRecommendations = () => useQuery({
  queryKey: queryKeys.slots.recommendations,
  queryFn: slotApi.getSlotRecommendations,
  // AI 기반 슬롯 생성 추천: 사용자 지출 패턴 분석 후 최적 예산 제안
})
```
**현재 상태**: useQuery 구조만 있고 실제 API 연동은 필요. slotApi 함수들은 기본 틀만 완성된 상태

**`src/hooks/useNotifications.ts` - ✅ 완전 구현됨 (Optimistic & Normalized)**
> **역할**: 푸시 알림 관련 데이터 조회, 상태 관리, 옵티미스틱 업데이트를 담당
```typescript
export const useNotifications = (params?: { page?: number; limit?: number; unreadOnly?: boolean; type?: NotificationItem['type']; }) =>
  useQuery({
    queryKey: queryKeys.notifications.list(params),
    queryFn: () => notificationApi.getNotifications(params),
    staleTime: 30_000,
    gcTime: 300_000,
  });

export const useUnreadNotificationCount = () =>
  useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: () => notificationApi.getUnreadCount(),
    staleTime: 10_000,
    refetchInterval: 30_000,
  });

export const useMarkNotificationAsRead = () => useMutation({
  mutationFn: (notificationId: string) => notificationApi.markAsRead(notificationId),
  onMutate: async (notificationId: string) => {
    // 옵티미스틱 업데이트: 서버 응답 전 UI 즉시 반영
    // 캐시 스냅샷 저장 후 읽음 상태 업데이트
    // unreadCount 감소 처리
  },
  onError: (_err, _id, ctx) => {
    // 실패 시 이전 상태로 롤백
  },
});

export const useMarkAllNotificationsAsRead = () => useMutation({
  mutationFn: () => notificationApi.markAllAsRead(),
  // 전체 알림 읽음 처리 with 옵티미스틱 업데이트
});

export const useDeleteNotification = () => useMutation({
  mutationFn: (notificationId: string) => notificationApi.deleteNotification(notificationId),
  // 알림 삭제 with 캐시에서 즉시 제거
});
```
**현재 상태**: TanStack Query + 옵티미스틱 업데이트 완전 구현. 모든 CRUD 작업에 캐시 동기화 포함

### 🎭 MSW (Mock Service Worker) 시스템
**`src/mocks/` - ✅ 완전 구현됨**
> **역할**: 백엔드 API가 준비되지 않은 상황에서 실제 네트워크 요청을 가로채서 Mock 응답을 제공하는 시스템

**MSW 핵심 구성요소**:
```typescript
// src/mocks/index.ts - MSW 초기화 및 설정 관리
export const initializeMSW = async (config?: Partial<MSWConfig>) => {
  // 개발 환경에서만 자동 활성화
  // React Native 폴리필 적용
  // 자동 연결 테스트 및 API 목록 표시
}

// src/mocks/server.ts - React Native용 MSW 서버
export const server = setupServer(...handlers);
// TextEncoder/TextDecoder 폴리필 적용
// 개발 환경 전용 로깅 및 에러 처리

// src/mocks/handlers/index.ts - 핸들러 통합 관리
export const handlers = [
  ...baseHandlers,          // 기본 상태 확인용 (/api/health, /api)
  // ...authHandlers,       // 각 기능별 개발 브랜치에서 주석 해제
  // ...accountHandlers,    // 필요한 API만 선택적 활성화
  // ...notificationHandlers,
  // ...slotHandlers,
];
```

**MSW 활용 방법**:
```typescript
// 1. 기존 API 호출 코드는 변경 없음
const response = await fetch('/api/notifications');
const data = await response.json();
// ↑ MSW가 자동으로 가로채서 Mock 데이터 반환

// 2. 개발 중 필요한 핸들러만 활성화
// src/mocks/handlers/index.ts의 예시 참고
import { notificationHandlers } from './notifications';
export const handlers = [...baseHandlers, ...notificationHandlers];

// 3. 개발 도구로 MSW 상태 확인
import { mswUtils } from '@/src/mocks';
await mswUtils.test.connection();    // MSW 연결 테스트
await mswUtils.test.allAPIs();       // 모든 API 테스트
```

**React Native 환경을 위한 강화된 Polyfill 시스템**:
- **최소 필수 폴리필**: Event, MessageEvent, EventTarget, BroadcastChannel, XMLHttpRequestUpload만 정의
- **조건부 로딩**: TransformStream, ReadableStream, WritableStream이 없을 때만 web-streams-polyfill 적용
- **에러 복구**: XMLHttpRequest.getAllResponseHeaders, getResponseHeader 메서드 안전성 보장
- **메모리 최적화**: 불필요한 polyfill 제거하여 앱 시작 시간 단축

**장점**:
- **실제 네트워크 호출 방식**: fetch, axios 등 기존 API 코드 변경 없이 사용
- **Faker.js 연동**: 실제와 유사한 한국어 Mock 데이터 자동 생성
- **개발 환경 격리**: `__DEV__` 조건으로 프로덕션에는 영향 없음
- **브랜치별 선택적 활성화**: 필요한 API만 Mock 처리 가능
- **자동 테스트 지원**: Jest 테스트에서도 동일한 Mock 데이터 사용

**현재 상태**: 
- ✅ React Native 환경 완전 구성 (필수 Polyfill 최소 집합)
- ✅ Notification 도메인 상대 경로 핸들러로 통일 (절대 URL 중복 제거)
- ✅ 자동 초기화 / 테스트 유틸 / 헬스 체크
- ✅ Fallback 플래그 환경 기반 초기화 + 런타임 토글 준비
- ✅ 강화된 polyfill 시스템으로 메모리 최적화 및 안정성 향상
- ✅ Metro 설정 최적화로 MSW 번들링 성능 개선

**`src/store/index.ts` - 📝 함수 틀만 완성**
> **역할**: 민감한 데이터(토큰)와 일반 설정을 안전하게 저장하고 관리하는 유틸리티 제공
```typescript
export const storageUtils = {
  saveToken: async (token: string) => { 
    // 목적: 로그인 시 받은 JWT 토큰을 암호화된 저장소에 안전하게 보관
    // await SecureStore.setItemAsync('auth_token', token); ← 실제 구현 코드 (주석 처리됨)
    console.log('Token saved securely'); ← 현재는 콘솔 출력만
  },
  
  getToken: async () => { 
    // 목적: API 호출 시 Authorization 헤더에 사용할 토큰 조회
    // return await SecureStore.getItemAsync('auth_token'); ← 실제 구현 코드 (주석 처리됨)
    return null; // ← 현재는 항상 null 반환 (로그인 안됨 상태)
  },
  
  deleteToken: async () => { 
    // 목적: 로그아웃 시 저장된 토큰 완전 삭제로 보안 강화
    // await SecureStore.deleteItemAsync('auth_token'); ← 실제 구현 코드 (주석 처리됨)
    console.log('Token deleted'); ← 현재는 콘솔 출력만
  }
}

// settingsUtils 객체는 선언되어 있으나 빈 상태 (테마, 언어 설정 등 추후 구현 예정)
```
**현재 상태**: 
- ✅ 함수 시그니처와 용도 정의 완료
- ⚠️ `expo-secure-store` 코드는 모두 주석 처리됨  
- ❌ 실제로는 토큰 저장/조회 기능 동작하지 않음

### 📱 화면 구현
**`app/(tabs)/dashboard/index.tsx` - ✅ 고도화 완료**
- **실제 동작하는 기능들**:
  - **계좌 캐러셀**: `AccountCarousel`로 여러 계좌 간 스와이프 네비게이션
  - **고정 헤더**: `AccountSummary`가 스크롤 시 상단 고정되는 애니메이션 효과
  - **도넛 차트**: `AccountDonutChart`로 선택된 계좌의 슬롯 현황 시각화
  - **미분류 슬롯**: `UncategorizedSlotCard`로 분류되지 않은 거래 표시
  - **애니메이션**: Animated API로 스크롤 기반 opacity, transform 효과
- **데이터 통합**: `SAMPLE_ACCOUNTS`, `BANK_CODES` 상수 활용으로 실제 운영 환경과 유사한 구조
- **성능 최적화**: React.memo, useMemo, useCallback으로 리렌더링 최소화
- **사용된 컴포넌트**: AccountSummary, AccountCarousel, AccountDonutChart, UncategorizedSlotCard
- **개선 필요**: 실제 API 연동, 로딩 상태, 에러 처리, 풀 투 리프레시

**`app/(tabs)/notifications/index.tsx` - ✅ 완전 구현됨**
- **실제 동작하는 기능들**:
  - TanStack Query 기반 알림 목록 조회 및 페이지네이션
  - 읽지 않은 알림 개수 배지 표시
  - Pull-to-refresh 새로고침 기능
  - 개별 알림 읽음 처리 (터치 시 자동 markAsRead)
  - Faker.js 기반 한국어 mock 데이터 (실제와 유사한 알림 내용)
  - 알림 타입별 아이콘 및 색상 구분 (예산 초과, 목표 달성, 계좌 동기화 등)
  - 로컬 푸시 알림 테스트 버튼들 (즉시 알림, 지연 알림, 예산 초과 시나리오 등)
- **사용된 기술**: `FlatList`, TanStack Query, `usePushNotificationSystem` 훅
- **현재 상태**: Mock 데이터 사용 중이나 실제 API 연동 준비 완료

**`app/(tabs)/_layout.tsx` - ✅ 기본 동작 완료**
- 4개 탭 구성: 대시보드, 리포트, 알림, 프로필
- 각 탭 아이콘 및 한국어 제목 설정
- 테마 기반 탭 색상 자동 변경
- **개선 필요**: 탭 전환 애니메이션, 배지 표시, 동적 탭 이름

### 🔒 타입 안정성
**`src/types/index.ts` - ✅ 기본 구조 완성**
> **역할**: 전체 앱에서 사용하는 데이터 구조와 API 응답 형태를 TypeScript로 엄격하게 정의
```typescript
// 사용자 인증 관련 타입들
export interface User {
  id: string;        // 백엔드에서 부여하는 고유 사용자 ID
  username: string;  // 로그인 시 사용하는 사용자명
  email: string;     // 이메일 주소 (중복 방지 및 비밀번호 재설정용)
}

export interface AuthState {
  user: User | null;     // 로그인 상태: User 객체 = 로그인됨, null = 비로그인
  isLoading: boolean;    // 로그인/로그아웃 처리 중 여부 (버튼 비활성화용)
  isAuthenticated: boolean; // 간편한 로그인 상태 확인용 불린값
}

// 계좌 관련 타입들
export interface Account {
  id: string;           // 계좌 고유 식별자
  accountNumber: string; // 계좌번호 (화면 표시용, 마스킹 처리됨)
  bankName: string;     // 은행명 (예: "국민은행", "신한은행")
  balance: number;      // 현재 잔액 (원 단위)
  accountType: 'CHECKING' | 'SAVINGS'; // 계좌 유형 (입출금통장 vs 적금)
}

// 슬롯(목표) 관련 타입들  
export interface Slot {
  id: string;           // 슬롯 고유 식별자
  name: string;         // 사용자가 지정한 목표명 (예: "여행 자금", "비상금")
  targetAmount: number; // 목표 금액 (원 단위)
  currentAmount: number; // 현재 저축 금액 (원 단위)
  deadline?: Date;      // 목표 달성 기한 (선택사항, undefined 가능)
  category: 'TRAVEL' | 'EMERGENCY' | 'EDUCATION' | 'OTHER'; // 목표 카테고리
}

// API 응답 공통 형태
export interface ApiResponse<T> {
  success: boolean;     // API 성공/실패 여부
  data: T;              // 실제 응답 데이터 (제네릭으로 타입 지정)
  message?: string;     // 에러 메시지 또는 성공 메시지 (선택사항)
}
```
**현재 상태**:
- ✅ 모든 주요 데이터 타입 정의 완료
- ✅ TypeScript 엄격 모드에서 에러 없음  
- ✅ API 응답과 UI 컴포넌트에서 안전하게 사용 가능
- **개선 필요**: 더 세밀한 유효성 검사, 런타임 타입 체크, 백엔드와 타입 동기화

### 🔔 푸시 알림 시스템 (최신 완성)

### 🔥 Firebase 푸시 알림 시스템 (신규 완성)

**`src/services/firebasePushService.ts` - ✅ 완전 구현됨**
> **역할**: Firebase Cloud Messaging(FCM)을 활용한 실제 푸시 알림 서비스
```typescript
class FirebasePushService {
  // FCM 토큰 발급 및 서버 등록
  public async initialize(): Promise<{ success: boolean; deviceId?: string }>
  
  // 포그라운드/백그라운드/종료 상태 메시지 리스너
  private setupMessageListeners(): void
  
  // 알림 클릭 시 화면 이동 처리
  private handleNotificationClick(remoteMessage): void
  
  // 테스트 푸시 전송 (MSW 통합)
  public async sendTestPush(payload): Promise<{ success: boolean; message: string }>
}
```

**주요 특징**:
- **MSW 통합**: 개발 환경에서 Mock API로 동작, 실제 백엔드 구현 시 자동 전환
- **토큰 관리**: FCM 토큰 발급, 갱신, 서버 등록 자동화
- **크로스 플랫폼**: Android/iOS 통합 처리
- **알림 처리**: 포그라운드 로컬 표시, 백그라운드 클릭 처리, 데이터 기반 화면 이동
- **에러 복구**: 토큰 발급 실패 시 Graceful Degradation

**`src/services/unifiedPushService.ts` - ✅ 완전 구현됨**
> **역할**: Firebase와 Expo Notifications를 통합하는 단일 인터페이스
```typescript
class UnifiedPushService {
  // Firebase + Expo 동시 초기화
  public async initialize(): Promise<{ firebase: boolean; expo: boolean }>
  
  // 사용자별 푸시 설정 연결/해제
  public async initializeForUser(userId): Promise<boolean>
  
  // 테스트 시나리오 모음
  public testScenarios = {
    budgetExceeded: async (slotName, amount) => { ... },
    goalAchieved: async (slotName) => { ... },
    accountSync: async (bankName) => { ... },
    spendingPattern: async (category, changePercent) => { ... }
  }
}
```

**통합 전략**:
- **우선순위**: Firebase → Expo 로컬 알림 순으로 시도
- **Fallback**: Firebase 실패 시 Expo 로컬 알림으로 자동 대체
- **상태 관리**: 각 서비스별 초기화 상태 및 토큰 정보 통합 관리
- **테스트 용이성**: 개발 환경에서 다양한 시나리오 테스트 지원

**`src/services/notificationService.ts` - ✅ 완전 구현됨**
> **역할**: 푸시 알림의 전체 생명주기를 관리하는 싱글톤 서비스 클래스
```typescript
class NotificationService {
  // 환경별 푸시 토큰 발급: Expo Go (Expo Token) vs Development Build (FCM Token)
  private async registerForPushNotifications(): Promise<string | null>
  
  // 알림 수신 리스너: Foreground, Background, App Killed 상태 모두 처리
  private setupNotificationListeners(): void
  
  // 알림 클릭 시 화면 이동 처리 (딥링킹)
  private handleNotificationResponse(response): void
  
  // 로컬 알림 전송 (테스트 및 오프라인 기능용)
  public async sendLocalNotification(title, body, data?): Promise<void>
  
  // 예약 알림 전송 (리마인더 기능)
  public async scheduleNotification(title, body, delaySeconds, data?): Promise<void>
  
  // 백엔드 등록용 토큰 데이터 생성 (환경, 플랫폼, 버전 정보 포함)
  public getPushTokenData(): PushTokenRequest | null
}
```

**주요 특징**:
- **환경별 자동 감지**: Expo Go vs Development Build 자동 판별 후 적절한 토큰 타입 발급
- **크로스 플랫폼**: Android/iOS 통합 처리, 플랫폼별 권한 및 설정 자동 관리
- **에러 복구**: 토큰 발급 실패 시에도 로컬 알림은 정상 동작하도록 Graceful Degradation
- **백엔드 연동 준비**: 토큰 타입(`expo` vs `fcm`), 환경(`development` vs `production`) 정보 포함

**테스트 알림 기능**:
- **즉시 알림**: `testNotifications.immediate()` - 알림 권한 및 표시 테스트
- **지연 알림**: `testNotifications.delayed(5)` - 백그라운드 알림 테스트
- **시나리오 알림**: 예산 초과, 목표 달성, 계좌 동기화 등 실제 사용 케이스 시뮬레이션
- **Firebase 테스트**: 알림 화면의 🚀 버튼으로 Firebase/Expo 통합 푸시 테스트 (개발 모드)

**현재 상태**: 
- ✅ 로컬 알림 완전 구현 및 테스트 완료
- ✅ 환경별 토큰 발급 로직 구현 완료
- ✅ Firebase 푸시 알림 시스템 완전 구현 (MSW 통합)
- ✅ 통합 푸시 서비스로 Firebase + Expo 동시 지원
- ⚠️ 실제 서버 푸시 발송은 백엔드 FCM 연동 및 Firebase 프로젝트 설정 필요

---

## 6. 알림(Notifications) 아키텍처 상세 (NEW)

| 레이어 | 책임 | 주요 파일 | 비고 |
|--------|------|-----------|------|
| API Client | HTTP 전송/인터셉터 | `src/api/client.ts` | baseURL 동적 (MSW 활성 시 '') |
| Domain API | 알림 CRUD + Fallback 트리거 | `src/api/notification.ts` | Prefix `[NOTIF_API]` |
| Normalizer | 응답 표준화 / 모호 응답 감지 | `src/api/responseNormalizer.ts` | Prefix `[NOTIF_NORMALIZER]` |
| Hooks | 캐시 + Optimistic | `src/hooks/useNotifications.ts` | 중복 로컬 상태 제거 |
| Logic Hook | 파생 필터·UI 로직 | `useNotificationLogic.ts` | setState 루프 제거 |
| Feature Flag | Fallback 런타임 토글 | `src/config/featureFlags.ts` | 환경 초기값 + setter |

### 6.1 Ambiguous Response 처리 흐름
1. Axios GET 수행 (일반 성공 기대) → data 검사.
2. `isAmbiguousAxiosBody(data)` → true (빈 객체/빈 문자열 등) 시 Fallback 활성 여부 확인.
3. 활성 시 `fetchNotificationsFallback()` 호출(fetch 기반 재요청).
4. 성공시 Normalizer 반환 → PaginatedResponse.
5. 실패시 에러 로깅 후 빈 PaginatedResponse Graceful 반환.

### 6.2 Optimistic 업데이트 규칙
- 목록 캐시 Key: `['notifications','list', page, paramsHash]` (현재 단순 page 기반 → 확장 대비 Hash 추상화 예정).
- Mutation 직전: Draft clone 후 항목/카운트 패치.
- 실패 시: onError 롤백 → QueryClient restore.
- 성공 시: 서버 응답 구조와 Divergence 없으면 추가 refetch 생략.

### 6.3 읽지 않은 개수(unreadCount) 동기화
- 읽음/삭제/전체읽음/생성 Mutation 모두 unreadCount 캐시 직접 증감.
- 음수 방지 clamp 적용 예정(TODO).

### 6.4 향후 Adapter 계측(Planning)
- Axios Adapter Wrap → raw response/bodyLength/content-type 기록.
- 빈 응답 재현 케이스 수집 후 Fallback 기본 비활성 전환 계획.

---

## 7. 환경 변수 & Feature Flags (NEW)

| 변수 | 예시 | 목적 | 비고 |
|------|------|------|------|
| `EXPO_PUBLIC_API_URL` | `https://api.dev.local` | 실서버 Base URL | MSW 활성 시 빈 문자열 우선 |
| `EXPO_PUBLIC_ENABLE_NOTIFICATION_FALLBACK` | `true` | 알림 목록 Fallback fetch 초기 활성 여부 | 런타임 토글로 override 가능 |
| `USE_MSW` (선택) | `true` | MSW 강제 활성 | 빌드타임 판단 보조 |

런타임 토글 API:
```ts
import { featureFlags } from '@/src/config/featureFlags';
featureFlags.setNotificationFallbackEnabled(false);
```

---

## 8. 로깅 컨벤션 (NEW)

| Prefix | 용도 | 예시 |
|--------|------|------|
| `[NOTIF_API]` | 알림 도메인 API/Mutation/에러 | `[NOTIF_API] markAsRead 실패` |
| `[NOTIF_NORMALIZER]` | 응답 정규화/모호 탐지/Fallback | `[NOTIF_NORMALIZER] ambiguous body -> fallback` |
| `[FEATURE_FLAGS]` | 런타임 플래그 변경 | `[FEATURE_FLAGS] notificationFallbackEnabled -> false` |
| (예정) `[HTTP]` | 전송/Adapter 계측 | 원시 응답 헤더, status, size |

참고:
- 현재 `src/api/client.ts`는 `[API]` / `[API][raw axios response]` 접두사를 사용 중입니다. 차기 작업에서 `[HTTP]`로 통일 예정입니다.
- 일부 훅(`useNotifications.ts`) 내 콘솔 로그는 접두사 미적용 상태가 남아있습니다. 단계적으로 `[NOTIF_API]` 또는 전용 접두사로 이관 예정입니다.

원칙:
- 모든 console 사용 시 도메인 Prefix 필수.
- 사용자 노출 문자열(한국어)은 메시지, 기술적 추적은 영어/구조 로그 혼합 허용.

---

## 9. 품질/성능 전략 (NEW)
- **중복 상태 제거**: Query Cache → 단일 진실 소스(Single Source of Truth).
- **Pagination 메타 표준화**: `{ page, limit, total, hasNext }`.
- **Re-renders 감소**: Query Key 파라미터 객체 안정화(불변 해시 or primitive 변환 예정).
- **Fallback 축소 로드맵**: Adapter 계측 → 모호 응답 근본 원인 해결 → 플래그 기본 false.
- **리스트 성능**: 대량 알림 도입 시 가상리스트(FlatList windowConfig 최적화 + RecyclerListView 고려) TODO.

---

## 10. 향후 개발 계획 (Revised Roadmap)

### Phase 1 (단기 / 진행 중)
| 항목 | 상태 | 메모 |
|------|------|------|
| Axios Adapter 계측 | 예정 | 빈 응답 재현 로그 수집 |
| Notification Fallback 런타임 패널 | 예정 | 개발자 디버그 스크린/전역 toggle |
| Auth 훅 실제 구현 | 미착수 | SecureStore 주석 해제 필요 |
| SecureStore 활성화 | 미착수 | expo-secure-store 설치 확인 |

### Phase 2 (기능 확장)
| 항목 | 내용 |
|------|------|
| 계좌/슬롯 API 실서버 연동 | Mock → 실제 HTTP 전환 |
| 알림 설정 화면 | 개별 타입 토글 + 시간대 + 임계값 |
| 슬롯 CRUD UI | 생성/편집/상세 차트 |

### Phase 3 (고도화)
| 항목 | 내용 |
|------|------|
| AI 추천/분석 | 지출 패턴 + 목표 제안 |
| 상태 저장 최적화 | Offline Sync + Partial hydration |
| Adapter 기반 지표 | 전송 시간/크기 수집 → 모니터링 |

### Phase 4 (품질/배포)
| 항목 | 내용 |
|------|------|
| 테스트 자동화 | Unit + Integration + E2E(MSW 재사용) |
| 성능 튜닝 | 번들 사이즈/메모리/리스트 렌더링 |
| 배포 파이프라인 | Store 설정 + Sentry/Analytics |

---

## 11. 즉시 실행 가능한 작업 (Updated)
1. Adapter 계측 래퍼 작성 (`createInstrumentedAxiosAdapter`) → 로우 바이트/헤더/transform 경과 로깅.
2. Fallback 토글 디버그 UI (개발자 메뉴 or 숨겨진 스크린) 추가.
3. SecureStore 실제 구현 반영 + `useAuth` 로그인 플로우.
4. Notification unreadCount 음수 클램프 보강.
5. Query Key 파라미터 해싱 유틸 (`stableParamsKey(params)`) 도입 준비.

추가:
6. `src/hooks/useNotifications.ts` 내 로그 접두사 통일 (`[NOTIF_HOOK]` 또는 `[NOTIF_API]`).
7. API Client 로깅 접두사 `[API]` → `[HTTP]` 전환.

---

## 12. 권장 코드 패턴 요약
- 도메인 API → Normalizer → Hook (순서 고정)
- Optimistic Mutation 시: (1) snapshot (2) draft mutate (3) rollback onError (4) selective refetch
- 모든 Feature Flag는 runtime setter 제공 (테스트 자동화 용이)
- 에러 메시지(사용자용)와 내부 로깅(개발자용) 구분

---

## 13. 용어 정리 (Glossary)
| 용어 | 정의 |
|------|------|
| Ambiguous Response | Axios data가 기대 JSON 대신 빈 문자열/빈 객체 등 불명확 상태 |
| Normalizer | 다양한 원본 응답을 앱 표준 Shape로 변환하는 계층 |
| Fallback Fetch | Axios 응답 모호 시 fetch 재요청 전략 |
| Optimistic Update | 서버 확정 이전 UI/캐시 선반영 후 실패 시 롤백 |
| Feature Flag | 기능 On/Off 제어(빌드타임 초기값 + 런타임 변경) |

---

## 14. 부록
### 14.1 PaginatedResponse 표준 형태
```ts
interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  message?: string;
  meta: { page: number; limit: number; total: number; hasNext: boolean };
  _fallback?: boolean; // Fallback 경로 여부 (디버깅)
}
```

### 14.2 Normalizer 간단 예시
```ts
export function normalizeNotificationList(raw: any, params?) {
  // 1) shape detection 2) mapping 3) meta 보정 4) 최종 반환
}
```

### 14.3 디버그 토글 예시
```ts
featureFlags.setNotificationFallbackEnabled(false);
console.log(featureFlags.snapshot());
```

---

문의 또는 구조 변경 제안은 PR 본문 최상단에 [ARCH] 태그를 붙여 제출해주세요.

---

## 15. Firebase 푸시 알림 구현 가이드 (NEW)

### 📋 단계별 구현 방법

**Phase 1: Firebase 프로젝트 설정 (외부 작업)**
1. Firebase Console에서 새 프로젝트 생성
2. Android 앱 등록 → `google-services.json` 다운로드 후 `android/app/` 폴더에 배치
3. iOS 앱 등록 → `GoogleService-Info.plist` 다운로드 후 `ios/[ProjectName]/` 폴더에 배치
4. iOS APNs 키 설정 (Apple Developer Console에서 생성한 .p8 키를 Firebase에 업로드)

**Phase 2: 개발 환경 테스트 (즉시 가능)**
```typescript
// 앱 시작 시 자동 초기화됨 (app/_layout.tsx)
// 수동 테스트 방법:

// 1. 콘솔에서 초기화
await initializePushService();

// 2. 푸시 상태 확인
getPushStatus();

// 3. 테스트 푸시 전송
await sendTestPush();

// 4. 알림 화면의 🚀 버튼 클릭
```

**Phase 3: MSW 통합으로 백엔드 없이 개발**
- FCM 토큰 등록: `POST /api/notifications/register-fcm-token`
- 토큰 갱신: `PUT /api/notifications/update-fcm-token`
- 테스트 푸시: `POST /api/notifications/send-test-push`
- 알림 수신 확인: `PATCH /api/notifications/{id}/received`

**Phase 4: 실제 백엔드 연동**
1. MSW 비활성화 (`__DEV__ = false` 또는 설정 변경)
2. 백엔드에서 위 API 엔드포인트 구현
3. Firebase Admin SDK로 실제 푸시 전송
4. 코드 변경 없이 자동 전환 완료

### 🧪 테스트 방법

**개발 콘솔 명령어**:
```javascript
// Firebase + Expo 통합 푸시 초기화
await initializePushService();

// 예산 초과 시나리오 테스트
await sendTestPush();

// 서비스 상태 확인
getPushStatus();
```

**알림 화면 UI 테스트**:
- 🚀 버튼: Firebase 푸시 테스트 (개발 모드에서만 표시)
- 테스트 성공/실패를 로컬 알림으로 피드백

**플랫폼별 특화 기능**:
- **Android**: FCM 토큰 기반 푸시 알림
- **iOS**: APNs 통합, 포그라운드 알림 자동 표시, 배지 카운트 지원
- **Cross-Platform**: 통합 서비스로 플랫폼 차이 자동 처리

**지원하는 시나리오**:
```typescript
// 1. 예산 초과 알림 (iOS에서 배지 카운트 자동 증가)
unifiedPushService.testScenarios.budgetExceeded('생활비', 50000);

// 2. 목표 달성 알림 (iOS에서 축하 사운드 재생)
unifiedPushService.testScenarios.goalAchieved('여행 적금');

// 3. 계좌 동기화 알림 (iOS에서 크리티컬 알림 지원)
unifiedPushService.testScenarios.accountSync('국민은행');

// 4. 지출 패턴 분석 알림 (iOS에서 미리보기 지원)
unifiedPushService.testScenarios.spendingPattern('카페', 30);
```

### 🍎 iOS 특화 설정

**필수 iOS 설정**:
1. `GoogleService-Info.plist` 파일을 `ios/[ProjectName]/` 폴더에 배치
2. Xcode에서 Push Notifications Capability 활성화
3. Apple Developer Console에서 APNs 키 생성 및 Firebase에 등록
4. `Info.plist`에 Firebase 관련 설정 추가

**iOS 전용 기능**:
- APNs 토큰 자동 등록 및 갱신
- 포그라운드에서도 알림 배너 표시
- 배지 카운트 자동 관리
- 크리티컬 알림 지원 (중요한 금융 알림용)
- 알림 카테고리 및 액션 버튼 지원

---

## 16. 2025-09-16 이후 주요 신규 기능 요약 (ver.2.1 추가사항)

### 🎯 온보딩 시스템 (신규 완성)
- **완전한 앱 첫 실행 경험**: 4단계 슬라이드로 앱 핵심 가치 전달
- **상태 기반 라우팅**: 온보딩 완료 여부에 따른 자동 화면 전환
- **개발자 친화적**: 전역 함수로 온보딩 상태 디버깅 지원

### 🏦 은행 통합 시스템 (신규 완성)
- **17개 주요 은행 지원**: 로고, 색상, 브랜딩 완전 매핑
- **고성능 이미지 처리**: expo-image 기반 캐싱 및 로딩 최적화
- **일관된 UX**: 모든 계좌 관련 컴포넌트에서 통일된 은행 정보 표시

### 📊 계좌/슬롯 시각화 (신규 완성)
- **인터랙티브 도넛 차트**: SVG 기반 슬롯 현황 시각화, 애니메이션 지원
- **계좌 캐러셀**: 스와이프 네비게이션으로 여러 계좌 간 전환
- **실시간 요약**: 고정 헤더로 계좌 정보 항상 접근 가능

### 🛠️ MSW 인프라 강화 (신규 완성)
- **최적화된 폴리필**: 메모리 사용량 최소화, 필수 기능만 선별 적용
- **안정성 향상**: XMLHttpRequest, BroadcastChannel 등 React Native 환경 완전 지원
- **개발 생산성**: 에러 복구, 조건부 로딩으로 개발 환경 안정화

### 📦 의존성 확장
- **차트 라이브러리**: Victory Native ^41.20.1 추가로 고급 시각화 준비
- **Firebase 통합**: FCM 기반 푸시 알림 인프라 설치 완료
- **폼 관리 강화**: React Hook Form + Zod + Resolver 통합 시스템

### 🎨 디자인 시스템 확장
- **샘플 데이터 체계화**: 실제 운영과 유사한 한국어 데이터 생성 시스템
- **컴포넌트 메모이제이션**: React.memo, useMemo로 렌더링 성능 최적화
- **애니메이션 통합**: Animated API 기반 스크롤 연동 효과

---

_End of ver.2.1 (2025-09-17 업데이트)_

### 🏗️ 기본 프로젝트 설정
- **Expo + TypeScript 환경 구축**: React Native 0.81.4, Expo SDK 54 기반의 모바일 앱 개발 환경 완료
- **절대 경로 설정**: `tsconfig.json`에서 `@/*` 매핑으로 `@/src/components/Button` 형태 import 가능
- **라우팅 구조**: Expo Router 기반 파일 기반 라우팅 (`app/(tabs)`, `app/(auth)` 등 그룹 라우팅 설정)
- **TanStack Query 설정**: `app/_layout.tsx`에 `QueryClientProvider` 설정하여 전역 서버 상태 관리 준비 완료
- **폼 관리 시스템**: React Hook Form + Zod 스키마 검증 시스템 도입
- **상태 관리**: Zustand 도입 완료 (클라이언트 상태 관리용)
- **Response Normalization**: 다양한 API 응답 형태를 표준화하는 normalizer 계층 구현

### 🎯 온보딩 시스템 (완전 구현됨)
**`app/(onboarding)/onboarding/index.tsx` - ✅ 완전 구현됨**
- **4단계 슬라이드 온보딩**: 슬롯 나누기, 지출 현황, 소비 분석, 계획적 소비 안내
- **인터랙티브 UI**: FlatList 기반 가로 스와이프, 페이지 인디케이터, 진행률 표시
- **상태 관리 통합**: `settingsUtils.setOnboardingCompleted()` 연동으로 완료 상태 영구 저장
- **조건부 라우팅**: `app/_layout.tsx`에서 온보딩 완료 여부에 따른 초기 화면 자동 전환
- **개발자 도구**: 전역 함수로 온보딩 리셋/완료/상태 확인 기능 (`resetOnboarding()`, `completeOnboarding()`, `checkOnboardingStatus()`)

**`src/store/index.ts` - ✅ 온보딩 관련 확장**
- **설정 관리 강화**: `settingsUtils.getSettings()`, `settingsUtils.saveSettings()` 범용 설정 저장
- **온보딩 전용 함수**: `setOnboardingCompleted()`, `getOnboardingCompleted()` 편의 메서드
- **타임스탬프 기록**: 온보딩 완료 시각을 `onboardingCompletedAt`으로 자동 저장
- **타입 안전성**: 제네릭 지원으로 설정 객체 타입 검증

### 🔔 푸시 알림 시스템 (완전 구현됨)
- **expo-notifications 통합**: 로컬/원격 푸시 알림 인프라 구축 완료
- **환경별 토큰 관리**: Expo Go (개발) vs Development Build (운영) 자동 감지 및 적절한 토큰 발급
- **크로스 플랫폼 지원**: Android/iOS 통합 권한 처리 및 알림 표시
- **알림 생명주기 관리**: Foreground/Background/App Killed 상태별 알림 수신 및 처리 로직
- **딥링킹 준비**: 알림 클릭 시 특정 화면으로 이동하는 라우팅 인프라
- **백엔드 연동 준비**: FCM 토큰 등록 API 및 환경 정보 전송 로직
- **테스트 도구**: 다양한 시나리오의 로컬 알림 테스트 기능

## 6. 향후 개발 계획

### 📋 Phase 1: 핵심 기능 구현 (1-2주)

**1.1 인증 시스템 완성**
- **로그인/회원가입 화면**: 새로운 화면 파일 생성 필요 (`app/(auth)/login.tsx`, `app/(auth)/register.tsx`)
  - 현재 상태: 아직 생성되지 않음, `app/(tabs)` 구조만 존재
  - 구현 내용: 이메일/비밀번호 입력 폼, 유효성 검사, 로딩 상태 관리
- **`useAuth` 훅 실제 구현**: 현재는 템플릿 상태, API 연동 필요
  - `src/hooks/useAuth.ts`의 TODO 부분을 실제 백엔드 API 호출로 교체
  - JWT 토큰 저장/조회를 위한 `storageUtils` 활성화 (주석 해제)
- **토큰 관리 로직**: `src/store/index.ts`의 SecureStore 코드 활성화
- 회원가입 시 필수 정보 입력 폼 및 유효성 검증

**1.2 계좌 연동 기능**
- **은행 API 연동**: `src/api/accountApi.ts`의 실제 구현
  - 현재 상태: 함수 시그니처만 정의됨, 실제 HTTP 요청 코드 없음
  - 구현 내용: 오픈뱅킹 API 또는 금융 데이터 제공업체와의 연동
- **계좌 목록 화면**: 새로운 화면 필요 (`app/(tabs)/accounts/index.tsx`)
  - 연결된 계좌들의 잔액, 은행명, 계좌번호(마스킹) 표시
  - 새 계좌 추가 버튼 및 계좌 삭제 기능
- **`useAccount` 훅 완성**: 실제 API 호출 및 캐싱 로직 구현

**1.3 슬롯 관리 시스템**
- **슬롯 생성/편집 화면**: 새로운 화면들 필요 (`app/(tabs)/slots/create.tsx`, `app/(tabs)/slots/edit/[id].tsx`)
  - 현재 상태: 대시보드에서만 슬롯 목록 표시, 관리 화면 없음
  - 구현 내용: 목표 금액 설정, 카테고리 선택, 마감일 설정 폼
- **`useSlots` 훅 실제 구현**: CRUD 기능 완성 (생성, 조회, 수정, 삭제)
  - `src/hooks/useSlots.ts`의 TODO 부분을 실제 API 호출로 교체
- **슬롯별 상세 화면**: 진행 상황, 거래 내역, 목표 달성률 차트 표시

**1.4 푸시 알림 백엔드 연동**
- **FCM 서버 설정 지원**: 백엔드/인프라팀과 협업하여 FCM 프로젝트 설정
- **실제 푸시 발송 테스트**: Development Build에서 원격 푸시 알림 테스트
- **알림 설정 화면**: 사용자가 알림 타입별로 켜기/끄기 설정할 수 있는 UI
- **토큰 갱신 로직**: 앱 업데이트, 재설치 시 토큰 자동 갱신 시스템

### 🎨 Phase 2: UI/UX 고도화 (2-3주)

**2.1 디자인 시스템 확장**
- **추가 공통 컴포넌트**: 현재 Button, InputField만 존재
  - 구현 필요: Modal, Card, Loading, Toast, ProgressBar, DatePicker 등
  - 모든 컴포넌트가 `src/constants/theme.ts`의 디자인 토큰 사용하도록 통일
- **애니메이션 및 제스처**: React Native Reanimated 또는 Lottie 도입
- **접근성 개선**: 스크린 리더 지원, 고대비 모드, 폰트 크기 조절
- 애니메이션 및 마이크로 인터랙션 추가
- **접근성 개선**: 스크린 리더 지원, 고대비 모드, 폰트 크기 조절

**2.2 화면 완성**
- **리포트 화면**: 새로운 화면 구현 필요 (`app/(tabs)/reports/index.tsx`)
  - 현재 상태: 탭만 정의됨, 실제 화면 없음
  - 구현 내용: 월별/주별 지출 분석, Victory Native 차트 연동, 지출 카테고리별 분석
- **프로필 화면**: 새로운 화면 구현 필요 (`app/(tabs)/profile/index.tsx`)
  - 현재 상태: 탭만 정의됨, 실제 화면 없음
  - 구현 내용: 사용자 정보 수정, 테마 설정, 알림 설정, 로그아웃
- **알림 설정 세부 화면**: 현재 알림 목록은 완성됨, 설정 화면 추가 필요
  - 알림 타입별 켜기/끄기 토글
  - 푸시 알림 시간대 설정
  - 예산 임계값 설정 (90%, 100%, 110% 등)

**2.3 상태 관리 고도화**
- **Zustand 활용**: 클라이언트 상태 관리를 위해 이미 설치됨 (^5.0.8)
  - 현재: TanStack Query로 서버 상태 관리, Zustand로 클라이언트 상태 관리 준비 완료
  - 활용 예정: 테마 설정, 앱 전역 UI 상태, 사용자 설정 등
- **오프라인 지원**: AsyncStorage와 네트워크 상태 감지를 통한 로컬 데이터 동기화
- **폼 상태 관리**: React Hook Form + Zod 검증 시스템 활용

### 🚀 Phase 3: 고급 기능 및 최적화 (3-4주)

**3.1 AI 기반 기능**
- **지출 패턴 분석**: 사용자의 거래 데이터를 분석하여 개인화된 예산 추천
  - 구현 방식: 백엔드 ML 모델과 연동 또는 클라이언트 측 간단한 통계 분석
- **자동 카테고리 분류**: 거래 내역의 상호명을 기반으로 지출 카테고리 자동 할당
- **절약 팁 제공**: 목표 달성률과 지출 패턴을 분석하여 맞춤형 절약 조언

**3.2 보안 및 인증 강화**
- **생체 인증**: `expo-local-authentication`을 이용한 지문/Face ID 로그인
- **2단계 인증**: SMS 또는 이메일을 통한 2FA 구현
- **앱 잠금 기능**: 백그라운드 전환 시 PIN/패턴으로 앱 재잠금

**3.3 성능 최적화**
- **New Architecture 검토**: React Native 0.79.5에서 Fabric 및 TurboModules 활성화 가능성 평가
- **번들 크기 최적화**: Metro bundler 설정 튜닝, 불필요한 라이브러리 제거
- **메모리 사용량 최적화**: 이미지 최적화, 리스트 가상화 적용
- 메모리 사용량 최적화 및 렌더링 성능 개선
- 이미지 최적화 및 번들 크기 축소

### 🧪 Phase 4: 품질 보증 (1-2주)

**4.1 테스트 자동화**
- Jest + React Native Testing Library 단위 테스트 작성
- Detox를 활용한 E2E 테스트 구현
- API 모킹 및 테스트 데이터 관리

**4.2 배포 준비**
- App Store / Google Play 스토어 배포 설정
- CodePush를 활용한 핫픽스 배포 시스템
- 에러 추적 (Sentry) 및 분석 도구 (Firebase Analytics) 연동

---

### 💡 개발 우선순위 가이드

**🔥 즉시 시작 가능한 작업 (백엔드 API 없이도 가능):**
1. **로그인/회원가입 화면 UI 구현**
   - `app/(auth)/login.tsx`, `app/(auth)/register.tsx` 파일 생성
   - 기존 `Button`, `InputField` 컴포넌트와 온보딩 디자인 패턴 활용하여 일관된 UI 구성
   
2. **슬롯 생성/편집 화면 UI 구현**
   - `app/(tabs)/slots/create.tsx` 파일 생성  
   - 기존 `AccountDonutChart`, 슬롯 색상 시스템 재사용하여 예산 입력 UI 구성
   
3. **데이터 저장 유틸 실제 구현**
   - `src/store/index.ts`에서 주석 처리된 SecureStore 코드 활성화
   - 온보딩 시스템에서 검증된 AsyncStorage 패턴 확장 적용

4. **차트 및 시각화 확장**
   - Victory Native ^41.20.1 활용하여 `AccountDonutChart` 외 추가 차트 컴포넌트 개발
   - 월별/주별 지출 트렌드, 슬롯별 사용률 히스토리 차트

5. **Firebase 연동 준비**
   - 설치된 `@react-native-firebase/app` ^23.3.1, `@react-native-firebase/messaging` ^23.3.1 설정
   - FCM 토큰 관리 및 백엔드 연동 API 준비

**⚠️ 백엔드 API 완성 후 진행할 작업:**
1. **`useAuth` 훅 실제 로직 구현**
   - 현재: `// TODO: 실제 로그인 API 호출` 주석만 있음
   - 필요: `src/api/auth.ts`의 login(), register() 함수와 연동
   
2. **`useAccount`, `useSlots` 훅 API 연동**
   - 현재: useQuery 구조만 있고 실제 API 호출 없음
   - 필요: 백엔드 API 엔드포인트와 연동

3. **푸시 알림 서버 발송 테스트**
   - 현재: 토큰 생성 및 등록 로직 완성됨
   - 필요: 백엔드 FCM 서버와 실제 푸시 발송 테스트

4. **실제 데이터 흐름 테스트**
   - 로그인 → 토큰 저장 → API 호출 → 화면 표시 전체 플로우 검증
