## 포팅 매뉴얼 (Porting Manual)

이 문서는 GitLab에서 소스 코드를 클론한 이후에 빌드하고 배포할 수 있도록 필요한 정보와 단계들을 정리한 가이드입니다. 아래 항목들은 첨부된 기준에 따라 구성되어 있습니다.

- 작성일: YYYY-MM-DD
## WalletSlot 포팅 매뉴얼 (프로젝트 맞춤)

목적: 이 문서는 이 저장소(Frontend)를 클론한 뒤 빠르게 빌드, 테스트, 배포할 수 있도록 프로젝트 전용 설정과 절차를 정리합니다. 민감정보(키/비밀번호)는 예시로만 제시하며 실제 값은 CI 비밀 또는 로컬 `.env`로 관리하세요.

문서 버전: 1.0
작성일: 2025-09-29

---

## 1. 현재 프로젝트 핵심 정보 (레포 스캔 결과)

- 프로젝트: WalletSlot (Expo + Bare React Native 혼합)
- repo 경로(로컬): c:\project\S13P21B108\Frontend
- Expo SDK: 54.0.8 (`package.json`)
- React Native: 0.81.4 (`package.json`)
- React: 19.1.0 (`package.json`)
- Gradle wrapper: gradle-8.14.3 (`android/gradle/wrapper/gradle-wrapper.properties`)
- Android Gradle plugin: com.android.tools.build:gradle (버전은 빌드스크립트가 관리)
- Google Services plugin: com.google.gms:google-services:4.4.1 (`android/build.gradle`)
- Hermes: enabled (`android/gradle.properties` hermesEnabled=true)
- Android applicationId / package: `com.walletslot.app` (`app.json`, `android/app/build.gradle`)
- Firebase config: `google-services.json` exists at repo root (루트)
- EAS projectId: 5ad0a526-ea05-4611-a7d0-23a44ed158a5 (`app.json.extra.eas.projectId`)

민감 파일 현황
- `google-services.json` — 루트에 존재 (클라이언트 API 키 포함; 클라이언트 키는 공개 위험은 낮지만 서버 시크릿은 아님)
- `android/app/debug.keystore` — `android/app/build.gradle`에서 debug keystore를 참조하지만 저장소에는 keystore 파일이 없음(로컬 생성 또는 CI 비밀로 관리 필요)

---

## 2. 로컬 포팅(개발) 단계

사전 요구사항
- Node.js LTS (권장 18.x/20.x 중 팀 표준) — `node -v`로 확인
- Java JDK 11 또는 17 (Gradle/Android 빌드 호환성 확인)
- Android SDK (API 레벨은 `android/build.gradle`의 compileSdkVersion 기준)
- Android Studio(선택) 또는 AVD/emulator

1) 저장소 클론

```powershell
cd C:\project\S13P21B108
git clone <git-url> Frontend
cd Frontend
```

2) 의존성 설치

```powershell
npm install
```

3) 환경 구성
- 루트에 `.env`를 만들거나 CI 변수로 설정하세요.
- 필수(예시): `API_BASE_URL`, `FIREBASE_PROJECT_ID`(= walletslot-9dc34), `GOOGLE_SERVICES_JSON_PATH=./google-services.json` 등

1) Expo/앱 실행(개발)

```powershell
npx expo start
# 또는 안드로이드 디버그
npx react-native run-android
```

5) 릴리즈(안드로이드) — 로컬 빌드

주의: 프로덕션 서명키는 반드시 안전하게 관리하세요. 현재 빌드스크립트는 debug 서명으로 릴리즈 구성에 서명하도록 설정되어 있습니다(권장하지 않음).

```powershell
cd android
.\gradlew assembleRelease
# 결과물: android/app/build/outputs/.../app-release.apk 또는 app-release.aab
```

권장: 프로덕션용 keystore를 생성하고 `signingConfigs`를 production 서명으로 설정, CI의 안전한 위치에 보관하세요.

Keystore 생성(예시):

```powershell
keytool -genkey -v -keystore release-keystore.jks -alias walletslot_release -keyalg RSA -keysize 2048 -validity 10000
```

---

## 3. CI / 배포 관련 지침

- CI에서 사용할 항목
  - `GOOGLE_SERVICES_JSON` 파일(보호된 파일로 저장) 또는 빌드 시 체크아웃된 상태 유지
  - Keystore 파일(프로덕션): CI의 시크릿/secure files로 업로드 후 빌드 시 다운로드
  - 환경 변수: API_BASE_URL, ANDROID_KEYSTORE_PASSWORD, ANDROID_KEY_ALIAS, ANDROID_KEY_PASSWORD

- GitLab CI 예시(요약):
  - before_script: node 설치, `npm ci`
  - build job: 체크아웃 → google-services.json 복사 → keystore 배치 → `cd android; ./gradlew assembleRelease`

보안 체크
- 절대 리포지토리에 비밀번호/시크릿을 커밋하지 마세요.
- `local.properties`(안드로이드 SDK 경로)는 개인 환경용이며 커밋 금지

---

## 4. 외부 서비스(현황 & 설정)

1) Firebase
- 위치: `google-services.json` (루트)
- project_id: walletslot-9dc34 (콘솔에서 Firebase 프로젝트 확인)
- 필요한 작업:
  - Android 패키지 `com.walletslot.app`과 일치하는지 확인
  - 프로덕션용 서명키 SHA-1 등록(FCM/Google Sign-In 필요 시)

2) @react-native-firebase/messaging (FCM)
- 패키지 설치 및 Android Manifest/서비스 설정 확인 (이미 플러그인 구성됨)

추가 서비스
- OAuth, Analytics, Storage 등 사용 시 각 서비스별 Client ID/Secret을 CI 시크릿으로 관리하세요.

---

## 5. DB 덤프 / 백엔드 연동

- 이 저장소는 프론트엔드 코드입니다. DB가 포함되어 있지 않으므로 DB 덤프는 백엔드 저장소에서 관리합니다.
- 필요 시 백엔드 팀에 다음을 요청하세요: 최신 덤프 파일(`db_dump_YYYYMMDD.sql`), 복원 스크립트 및 익명화 여부

---

## 6. 시연(데모) 시나리오 및 체크리스트 (실전)

이하 시나리오는 로컬/CI 빌드 후 데모에서 반드시 검증해야 할 항목들입니다.

샘플 시나리오 A: 신규 회원가입 + 알림 동의
- 시작: 앱 실행 (Splash 화면 확인)
- 이동: 회원가입 화면 열기 (경로: `app/(auth)/(signup)/notification-consent.tsx`)
- 입력: 이메일/비밀번호 입력
- 동작: '알림 동의' 토글 ON → 회원가입 버튼 클릭
- 기대 결과: 회원가입 API 2xx 응답, 홈/프로필 화면으로 네비게이트, FCM 토큰이 서버에 등록됨

검증 포인트
- 네트워크: API 요청/응답 코드 확인 (DevTools/Charles/mitmproxy)
- 로그: 콘솔 로그, device logcat (Android)
- UI: 버튼/로딩 표시, 에러 메시지 노출

데모 체크리스트(요약)
- [ ] `google-services.json` 존재 및 package name 일치
- [ ] `.env`(또는 CI 변수) 설정 완료
- [ ] 빌드(디버그/릴리즈) 성공
- [ ] 회원가입/알림 시나리오 정상 동작
- [ ] 로그 및 네트워크 레코드 확보

부가: 리포지토리 루트에 `DEMO_CHECKLIST.md`와 `scripts/verify_demo.ps1`가 있으니 데모 전 실행하세요.

```powershell
cd C:\project\S13P21B108\Frontend
.\scripts\verify_demo.ps1
```

---

## 부록: 파일/경로 요약

- 앱 소스: `app/`, `src/`
- Android 빌드: `android/` (gradle, wrapper: gradle-8.14.3)
- Expo 설정: `app.json` (googleServicesFile: ./google-services.json)
- Firebase config: `google-services.json` (루트)
- 데모 도구: `DEMO_CHECKLIST.md`, `scripts/verify_demo.ps1`