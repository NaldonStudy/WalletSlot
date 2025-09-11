# WalletSlot 개발 가이드 ver.1

## 1. 프로젝트 개요

본 문서는 WalletSlot 애플리케이션 개발을 위한 공식 가이드입니다. 프로젝트의 기술 스택, 아키텍처, 파일 구조, 개발 규칙 등을 정의하여 일관성 있고 효율적인 개발을 목표로 합니다.

---

## 2. 기술 스택

- **React Native**: 0.81.4
- **Expo**: ^54.0.1 (SDK 54)
- **React**: 19.1.0
- **TypeScript**: ~5.9.2
- **TanStack Query**: ^5.87.1
- **Axios**: ^1.11.0
- **Zustand**: ^5.0.8 (Client State Management)
- **expo-notifications**: ~0.32.10 (푸시 알림 시스템)
- **expo-device**: ~8.0.6 (기기 정보 및 권한 관리)
- **expo-constants**: ~18.0.8 (앱 및 환경 설정 정보)
- **@faker-js/faker**: ^10.0.0 (개발용 Mock 데이터 생성)
- **react-hook-form**: ^7.62.0 (폼 상태 관리)
- **zod**: ^4.1.5 (스키마 검증)

---

## 3. 현재 파일 구조 및 역할

```
/                        # Frontend 루트 디렉토리 
├── app/                 # Expo 라우터 기반 화면 구성
│   ├── (auth)/          # 인증(로그인, 회원가입) 관련 화면 그룹 (빈 폴더)
│   ├── (linking)/       # 딥링킹, 외부 연동 관련 화면 그룹 (빈 폴더)
│   ├── (onboarding)/    # 온보딩(앱 최초 실행 시 안내) 화면 그룹 (빈 폴더)
│   ├── (tabs)/          # 메인 탭 네비게이션 그룹
│   │   ├── _layout.tsx  # 탭 레이아웃 및 4개 탭 설정 (대시보드, 리포트, 알림, 프로필)
│   │   ├── dashboard/   # 대시보드 탭 폴더
│   │   │   ├── index.tsx    # 메인 대시보드 화면 (완전 구현됨)
│   │   │   └── _layout.tsx  # 대시보드 내부 스택 네비게이션
│   │   ├── report/      # 리포트 탭 폴더
│   │   │   ├── index.tsx    # 리포트 메인 화면 (플레이스홀더)
│   │   │   └── _layout.tsx  # 리포트 내부 스택 네비게이션
│   │   ├── notifications/ # 알림 탭 폴더
│   │   │   ├── index.tsx    # 알림 목록 화면 (완전 구현됨)
│   │   │   └── _layout.tsx  # 알림 내부 스택 네비게이션
│   │   └── profile/     # 프로필 탭 폴더
│   │       ├── index.tsx    # 프로필 설정 화면 (플레이스홀더)
│   │       └── _layout.tsx  # 프로필 내부 스택 네비게이션
│   ├── +not-found.tsx   # 일치하는 라우트가 없을 때 표시될 화면
│   └── _layout.tsx      # 앱 전체의 최상위 레이아웃 (폰트, 테마 프로바이더 등 설정)
│
├── src/                 # 핵심 소스 코드 
│   ├── api/             # API 관련 로직
│   │   ├── client.ts    # Axios 인스턴스 및 인증 토큰 인터셉터 설정
│   │   ├── queryKeys.ts # TanStack Query 키 중앙 관리
│   │   ├── queryClient.ts # TanStack Query 클라이언트 설정 및 초기화
│   │   ├── account.ts   # 계좌 관련 API 함수 (템플릿)
│   │   ├── auth.ts      # 인증 관련 API 함수 (템플릿)
│   │   ├── slot.ts      # 슬롯 관련 API 함수 (템플릿)
│   │   ├── notification.ts # 푸시 알림 관련 API 함수 (완전 구현됨)
│   │   └── index.ts     # API 함수들을 모아서 export
│   │
│   ├── components/      # 커스텀 재사용 컴포넌트 (WalletSlot 전용)
│   │   ├── common/      # 범용 컴포넌트 폴더 (빈 폴더)
│   │   ├── Button.tsx   # 테마 기반 버튼 컴포넌트 (완전 구현됨)
│   │   ├── InputField.tsx # 폼 입력 필드 컴포넌트 (완전 구현됨)
│   │   └── index.ts     # 컴포넌트들을 모아서 export
│   │
│   ├── constants/       # 앱 전역 상수
│   │   ├── theme.ts     # 디자인 시스템 (완전 구현됨)
│   │   ├── Colors.ts    # 기본 색상 정의 (라이트/다크 모드)
│   │   └── index.ts     # 상수들을 모아서 export
│   │
│   ├── hooks/           # 비즈니스 로직을 담는 커스텀 훅
│   │   ├── useAccount.ts # 계좌 데이터 관리 훅 (구조만 완성)
│   │   ├── useAuth.ts   # 인증 상태 관리 훅 (구조만 완성)
│   │   ├── useSlots.ts  # 슬롯 데이터 관리 훅 (구조만 완성)
│   │   ├── useNotifications.ts # 푸시 알림 시스템 관리 훅 (완전 구현됨)
│   │   ├── useTheme.ts  # 테마 관련 유틸리티 훅
│   │   └── index.ts     # 훅들을 모아서 export
│   │
│   ├── services/        # 비즈니스 로직 서비스 클래스
│   │   ├── notificationService.ts # 푸시 알림 통합 관리 서비스 (완전 구현됨)
│   │   └── index.ts     # 서비스들을 모아서 export
│   │
│   ├── store/           # 데이터 저장소 및 클라이언트 상태 관리
│   │   ├── appStore.ts  # Zustand 기반 전역 상태 관리 (기본 구조)
│   │   ├── authStore.ts # 인증 상태 전용 스토어 (기본 구조)
│   │   └── index.ts     # SecureStore/AsyncStorage 래퍼 유틸 (구조만 완성)
│   │
│   ├── types/           # 전역 타입 정의
│   │   └── index.ts     # API 응답, 컴포넌트 props 등 핵심 타입 관리 (완전 구현됨)
│   │
│   └── utils/           # 특정 도메인에 종속되지 않는 유틸리티 함수
│       └── index.ts     # 유틸리티 함수들 (기본 구조만)
│
├── components/          # Expo 기본 컴포넌트들 (ThemedText, ThemedView 등)
│   ├── Collapsible.tsx  # 접을 수 있는 섹션 컴포넌트
│   ├── ExternalLink.tsx # 외부 링크 컴포넌트
│   ├── HapticTab.tsx    # 햅틱 피드백이 있는 탭 버튼
│   ├── HelloWave.tsx    # 애니메이션 손흔들기 컴포넌트
│   ├── ParallaxScrollView.tsx # 패럴랙스 스크롤 뷰
│   ├── ThemedText.tsx   # 테마 기반 텍스트 컴포넌트
│   ├── ThemedView.tsx   # 테마 기반 View 컴포넌트
│   └── ui/              # UI 관련 유틸리티 컴포넌트
│       ├── IconSymbol.tsx       # SF Symbols 아이콘 컴포넌트
│       ├── IconSymbol.ios.tsx   # iOS 전용 아이콘
│       ├── TabBarBackground.tsx # 탭바 배경 컴포넌트
│       └── TabBarBackground.ios.tsx # iOS 전용 탭바 배경
│
├── hooks/               # Expo 기본 훅들
│   ├── useColorScheme.ts    # 다크/라이트 모드 감지
│   ├── useColorScheme.web.ts # 웹 전용 색상 스킴
│   └── useThemeColor.ts     # 테마 색상 조회 훅
│
├── assets/              # 정적 파일 (이미지, 폰트)
│   ├── fonts/           # 커스텀 폰트 파일
│   └── images/          # 앱 아이콘, 스플래시 이미지 등
│
├── .expo/               # Expo 빌드 캐시 및 설정
├── .vscode/             # VS Code 워크스페이스 설정
├── scripts/             # 프로젝트 스크립트 (reset-project.js)
├── package.json         # 의존성 및 스크립트 정의
├── tsconfig.json        # TypeScript 설정 (`@/*` 절대경로 포함)
├── app.json             # Expo 앱 설정 (이름, 아이콘, 플러그인, 푸시 알림 권한 등)
└── DEVELOPMENT_GUIDE.md # 이 개발 가이드 문서
```

---

## 4. 현재까지 완성된 기능

### 🏗️ 기본 프로젝트 설정
- **Expo + TypeScript 환경 구축**: React Native 0.79.5, Expo SDK 53 기반의 모바일 앱 개발 환경 완료
- **절대 경로 설정**: `tsconfig.json`에서 `@/*` 매핑으로 `@/src/components/Button` 형태 import 가능
- **라우팅 구조**: Expo Router 기반 파일 기반 라우팅 (`app/(tabs)`, `app/(auth)` 등 그룹 라우팅 설정)

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

### 🌐 API 통신 인프라
**`src/api/client.ts` - ✅ 기본 동작 완료**
- `axiosInstance`: 기본 설정이 적용된 Axios 인스턴스
- Request 인터셉터: 자동 Authorization 헤더 추가
- Response 인터셉터: 401 에러 시 자동 로그아웃 처리
- **개선 필요**: 네트워크 상태 감지, 재시도 로직, 더 세밀한 에러 핸들링

**`src/api/queryKeys.ts` - ✅ 구조 완성**
> **역할**: TanStack Query의 캐시 키를 중앙에서 관리하여 데이터 무효화와 재조회를 체계적으로 처리
```typescript
export const queryKeys = {
  user: {
    profile: ['user', 'profile'],           // 사용자 프로필 정보 캐시 키
    preferences: ['user', 'preferences']    // 사용자 앱 설정 정보 캐시 키
  },
  accounts: {
    all: ['accounts'],                      // 전체 계좌 목록 캐시 키
    detail: (id: string) => ['accounts', id],              // 특정 계좌 상세 정보 캐시 키
    transactions: (id: string) => ['accounts', id, 'transactions']  // 계좌별 거래내역 캐시 키
  },
  slots: {
    all: ['slots'],                         // 전체 슬롯 목록 캐시 키  
    detail: (id: string) => ['slots', id],                 // 특정 슬롯 상세 정보 캐시 키
    recommendations: ['slots', 'recommendations']          // AI 슬롯 추천 데이터 캐시 키
  },
  notifications: {
    list: (page: number) => ['notifications', 'list', page],  // 페이지네이션된 알림 목록 캐시 키
    unreadCount: ['notifications', 'unreadCount'],            // 읽지 않은 알림 개수 캐시 키
    settings: ['notifications', 'settings']                   // 알림 설정 정보 캐시 키
  }
}
```
**사용 예시**: `queryClient.invalidateQueries(queryKeys.accounts.all)` → 모든 계좌 데이터 새로고침

**API 함수 템플릿 - 📝 기본 구조만 완성**
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
- **`src/api/notification.ts` - ✅ 완전 구현됨**: 
  - `getNotifications(page)`: 페이지네이션된 알림 목록 조회 (현재 mock 데이터 반환)
  - `getUnreadNotificationCount()`: 읽지 않은 알림 개수 조회
  - `markAsRead(notificationId)`: 특정 알림을 읽음 처리
  - `registerPushToken(tokenData)`: 푸시 토큰을 서버에 등록
  - `getNotificationSettings()`: 사용자의 알림 설정 조회
  - `updateNotificationSettings(settings)`: 알림 설정 업데이트

**현재 상태**: 모든 함수가 TypeScript 타입과 함께 정의되어 있으나, 알림 API를 제외하고는 실제 API 호출 로직이 주석 처리되어 있고 mock 데이터 반환

### 🔧 비즈니스 로직 기반
**`src/hooks/useAuth.ts` - 📝 기본 구조만 완성**
> **역할**: 인증 관련 상태와 로직을 컴포넌트에서 쉽게 사용할 수 있도록 캡슐화
```typescript
export const useAuth = () => {
  // TODO: 실제 로그인 API 호출 로직 구현 필요
  const login = async (email: string, password: string) => { 
    // 1. 입력값 유효성 검증
    // 2. API 호출하여 토큰 받기 
    // 3. SecureStore에 토큰 저장
    // 4. 사용자 인증 상태 업데이트
  }
  const logout = async () => { 
    // 1. SecureStore에서 토큰 삭제
    // 2. 사용자 상태 초기화 
    // 3. 캐시된 데이터 클리어
  }
  const register = async (userData: RegisterRequest) => { 
    // 회원가입 처리 로직 
  }
  return { login, logout, register, isAuthenticated: false }
}
```
**현재 상태**: 함수 시그니처와 반환 타입은 완성되었으나, 내부 로직은 모두 주석으로 TODO 표시

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

**`src/hooks/useNotifications.ts` - ✅ 완전 구현됨**
> **역할**: 푸시 알림 관련 데이터 조회, 상태 관리, 시스템 초기화를 캡슐화
```typescript
export const useNotifications = (page: number = 1) => useQuery({
  queryKey: queryKeys.notifications.list(page),
  queryFn: () => notificationApi.getNotifications(page),
  staleTime: 2 * 60 * 1000, // 2분간 캐시 유지
  // 페이지네이션된 알림 목록 조회, 풀 투 리프레시 지원
})

export const useUnreadNotificationCount = () => useQuery({
  queryKey: queryKeys.notifications.unreadCount,
  queryFn: notificationApi.getUnreadNotificationCount,
  refetchInterval: 30 * 1000, // 30초마다 자동 갱신
  // 앱 아이콘 배지 및 탭 배지 표시용 읽지 않은 알림 개수
})

export const usePushNotificationSystem = () => {
  // 푸시 알림 시스템 초기화: 권한 요청 → 토큰 발급 → 서버 등록 → 리스너 설정
  // NotificationService 싱글톤과 연동하여 전체 시스템 관리
}

export const useMarkAsRead = () => useMutation({
  mutationFn: notificationApi.markAsRead,
  onSuccess: () => queryClient.invalidateQueries(queryKeys.notifications.list),
  // 알림 읽음 처리 후 목록 새로고침
})
```
**현재 상태**: TanStack Query 기반으로 완전히 구현됨. Mock 데이터 사용 중이나 실제 API 연동 준비 완료

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
**`app/(tabs)/dashboard/index.tsx` - ✅ 기본 동작 완료**
- **실제 동작하는 기능들**:
  - 샘플 데이터 생성 함수: `generateUserData()`, `generateAccountData()`, `generateSampleSlots()`
  - 계좌 잔액 카드 UI, 슬롯별 예산 현황 카드
  - 진행률 바 (예산 대비 사용 금액), 슬롯 액션 버튼
  - 한국어 샘플 데이터 (은행명, 사용자명, 슬롯 카테고리)
- **사용된 컴포넌트**: `Button`, 테마 시스템, 한국 실정에 맞는 UI
- **개선 필요**: 실제 API 연동, 로딩 상태, 에러 처리, 풀 투 리프레시, 애니메이션

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

**현재 상태**: 
- ✅ 로컬 알림 완전 구현 및 테스트 완료
- ✅ 환경별 토큰 발급 로직 구현 완료
- ⚠️ 실제 서버 푸시 발송은 백엔드 FCM 연동 필요

---

## 5. 현재까지 완성된 기능 (업데이트됨)

### 🏗️ 기본 프로젝트 설정
- **Expo + TypeScript 환경 구축**: React Native 0.81.4, Expo SDK 54 기반의 모바일 앱 개발 환경 완료
- **절대 경로 설정**: `tsconfig.json`에서 `@/*` 매핑으로 `@/src/components/Button` 형태 import 가능
- **라우팅 구조**: Expo Router 기반 파일 기반 라우팅 (`app/(tabs)`, `app/(auth)` 등 그룹 라우팅 설정)
- **TanStack Query 설정**: `app/_layout.tsx`에 `QueryClientProvider` 설정하여 전역 서버 상태 관리 준비 완료
- **폼 관리 시스템**: React Hook Form + Zod 스키마 검증 시스템 도입
- **상태 관리**: Zustand 도입 완료 (클라이언트 상태 관리용)

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
   - 기존 `Button`, `InputField` 컴포넌트 활용하여 폼 구성
   
2. **슬롯 생성/편집 화면 UI 구현**
   - `app/(tabs)/slots/create.tsx` 파일 생성  
   - 예산 입력, 카테고리 선택 등 UI 구성
   
3. **데이터 저장 유틸 실제 구현**
   - `src/store/index.ts`에서 주석 처리된 SecureStore 코드 활성화
   - `expo-secure-store` 라이브러리 사용법 학습 및 적용

4. **푸시 알림 백엔드 연동 준비**
   - 현재 로컬 알림은 완전히 동작함
   - FCM 설정 가이드 문서 작성
   - Development Build 테스트 환경 구성

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
