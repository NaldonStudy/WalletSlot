# 환경 변수 설정 가이드

이 프로젝트는 민감한 정보를 환경 변수로 관리합니다. 
로컬 개발 환경을 설정하려면 `.env.example` 파일을 참고하여 환경 변수를 설정하세요.

## 설정 방법

### 1. 환경 변수 파일 생성
`.env.example` 파일을 복사하여 `.env` 파일을 생성하고 실제 값을 입력하세요.

```bash
cp .env.example .env
```

### 2. 필수 환경 변수

다음 환경 변수들은 반드시 설정해야 합니다:

- **Database**: `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`
- **JWT**: `JWT_SECRET_B64`
- **Pepper**: `PEPPER_CIPHER_V1`, `PEPPER_CIPHER_V0`
- **OTP**: `OTP_SECRET`
- **AES Encryption**: `AES_BASE64_KEY`

### 3. 외부 API 키

다음 API 키들은 각 서비스에서 발급받아야 합니다:

- **SSAFY Finance API**: `SSAFY_FINANCE_API_KEY`, `SSAFY_FINANCE_USER_KEY`
- **SSAFY GMS**: `SSAFY_GMS_KEY`
- **OpenAI**: `OPENAI_API_KEY`
- **FCM**: `FCM_PROJECT_ID`, `FCM_SERVICE_ACCOUNT_JSON_PATH` (Firebase Admin SDK JSON 파일 경로)
- **Aligo SMS**: `ALIGO_API_KEY`, `ALIGO_USER_ID`, `ALIGO_SENDER`
- **Naver OCR**: `NAVER_OCR_INVOKE_URL`, `NAVER_OCR_PROJECT_ID`, `NAVER_OCR_PRIVATE_KEY`, `NAVER_OCR_SECRET`

### 4. Firebase Admin SDK 설정

Firebase Admin SDK JSON 파일은 별도로 관리해야 합니다:
1. Firebase Console에서 서비스 계정 키를 다운로드
2. 프로젝트 루트에 저장 (예: `src/main/resources/firebase-adminsdk.json`)
3. `.env` 파일에 `FCM_SERVICE_ACCOUNT_JSON_PATH` 경로 설정
4. **중요**: Firebase Admin SDK JSON 파일은 절대 Git에 커밋하지 마세요!

### 5. 프로필별 설정

- **dev**: `application-dev.yml` - 개발 환경 설정
- **test**: `application-test.yml` - 테스트 환경 설정  
- **prod**: `application-prod.yml` - 프로덕션 환경 설정 (환경 변수 필수)

## 보안 주의사항

⚠️ **절대 다음 파일들을 Git에 커밋하지 마세요:**
- `.env` 파일
- Firebase Admin SDK JSON 파일 (`*-firebase-adminsdk-*.json`)
- 개인 키 파일 (`.pem`, `.key`, `.p12`, `.jks`)

이미 `.gitignore`에 추가되어 있지만, 확인해보세요.

