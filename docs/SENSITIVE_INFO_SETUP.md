# 민감 정보 설정 가이드

이 문서는 프로젝트에서 제거된 민감 정보들을 다시 설정하는 방법을 안내합니다.

## 목차
1. [애플리케이션 설정 파일](#애플리케이션-설정-파일)
2. [Firebase 설정](#firebase-설정)
3. [데이터베이스 설정](#데이터베이스-설정)
4. [배포 환경 설정](#배포-환경-설정)
5. [유틸리티 설정](#유틸리티-설정)

---

## 애플리케이션 설정 파일

### 1. `walletslot-backend/src/main/resources/application.yml`

#### API 키 설정
```yaml
api:
  ssafy:
    finance:
      baseUrl: https://finopenapi.ssafy.io
      apiKey: <<·SSAFY 금융 API 키·>>  # SSAFY 금융 API 키로 교체
      userKey: <<·SSAFY 금융 사용자 키·>>  # SSAFY 금융 사용자 키로 교체
    gms:
      key: <<·SSAFY GMS API 키·>>  # SSAFY GMS API 키로 교체
  haeji:
    openai:
      key: <<·OpenAI API 키·>>  # OpenAI API 키로 교체
```

#### SMS 설정 (Aligo)
```yaml
app:
  sms:
    provider: aligo
    aligo:
      key: <<·Aligo SMS API 키·>>  # Aligo SMS API 키로 교체
      userId: <<·Aligo 사용자 ID·>>  # Aligo 사용자 ID로 교체
      sender: <<·Aligo 발신번호 (사전 등록 필수)·>>  # 사전 등록된 발신번호로 교체
```

#### 보안 설정
```yaml
app:
  security:
    jwt:
      secret_b64: <<·JWT 서명용 Base64 인코딩된 비밀키·>>  # Base64로 인코딩된 JWT 서명 키로 교체
    refresh:
      hash-pepper: <<·리프레시 토큰 해시용 페퍼 값·>>  # 리프레시 토큰 해시용 페퍼 값으로 교체
    pepper:
      cipher:
        pepper_v1: <<·비밀번호 암호화용 페퍼 v1 (plain:접두사 포함)·>>  # 예: "plain:your-secret-value"
        pepper_v0: <<·비밀번호 암호화용 페퍼 v0 (이전 버전)·>>  # 이전 버전 페퍼 (선택사항)
    otp:
      secret: <<·OTP 생성용 비밀키 (32바이트 hex 문자열)·>>  # 32바이트 hex 문자열로 교체
```

#### 암호화 설정
```yaml
encryption:
  aes:
    base64-key: <<·AES 암호화용 Base64 인코딩된 키·>>  # AES 암호화용 Base64 키로 교체
```

#### 네이버 OCR 설정
```yaml
naver:
  ocr:
    enabled: true
    invoke-url: <<·네이버 OCR API 호출 URL (호스트만, 뒤에 / 없음)·>>  # 예: "https://xxx.apigw.ntruss.com"
    receipt-path: "/custom/v1/{projectId}/{privateKey}/document/receipt"
    project-id: <<·네이버 OCR 프로젝트 ID (Invoke URL의 첫 세그먼트)·>>  # Invoke URL의 첫 번째 세그먼트
    private-key: <<·네이버 OCR 개인 키 (Invoke URL의 두 번째 세그먼트)·>>  # Invoke URL의 두 번째 세그먼트
    secret: <<·네이버 OCR 시크릿 키 (Base64 인코딩)·>>  # 네이버 OCR 시크릿 키로 교체
    version: "V2"
```

---

### 2. `walletslot-backend/src/main/resources/application-dev.yml`

#### 데이터베이스 설정
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/walletslotdb?useSSL=false&serverTimezone=Asia/Seoul&characterEncoding=UTF-8&allowPublicKeyRetrieval=true
    username: <<·개발 환경 MySQL 사용자명·>>  # 개발 환경 MySQL 사용자명으로 교체 (예: "root")
    password: <<·개발 환경 MySQL 비밀번호·>>  # 개발 환경 MySQL 비밀번호로 교체
```

#### 보안 설정
```yaml
app:
  security:
    jwt:
      secret_b64: <<·개발 환경 JWT 서명용 Base64 인코딩된 비밀키·>>  # 개발 환경용 JWT 키로 교체
    refresh:
      hash-pepper: <<·개발 환경 리프레시 토큰 해시용 페퍼 값·>>  # 개발 환경용 페퍼 값으로 교체
    pepper:
      cipher:
        pepper_v1: <<·개발 환경 비밀번호 암호화용 페퍼 v1 (plain:접두사 포함)·>>  # 예: "plain:dev-secret"
        pepper_v0: <<·개발 환경 비밀번호 암호화용 페퍼 v0·>>  # 개발 환경용 이전 버전 페퍼
```

#### API 키 설정
```yaml
api:
  ssafy:
    finance:
      baseUrl: https://finopenapi.ssafy.io
      apiKey: <<·개발 환경 SSAFY 금융 API 키·>>  # 개발 환경용 SSAFY 금융 API 키로 교체
      userKey: <<·개발 환경 SSAFY 금융 사용자 키·>>  # 개발 환경용 SSAFY 금융 사용자 키로 교체
    gms:
      key: <<·개발 환경 SSAFY GMS API 키·>>  # 개발 환경용 SSAFY GMS API 키로 교체
  haeji:
    openai:
      key: <<·개발 환경 OpenAI API 키·>>  # 개발 환경용 OpenAI API 키로 교체
```

---

### 3. `walletslot-backend/src/main/resources/application-test.yml`

#### 데이터베이스 설정
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/walletslotdb?useSSL=false&serverTimezone=Asia/Seoul&characterEncoding=UTF-8&allowPublicKeyRetrieval=true
    username: <<·테스트 환경 MySQL 사용자명·>>  # 테스트 환경 MySQL 사용자명으로 교체
    password: <<·테스트 환경 MySQL 비밀번호·>>  # 테스트 환경 MySQL 비밀번호로 교체
```

#### 보안 설정
```yaml
app:
  security:
    jwt:
      secret_b64: ${JWT_SECRET_B64:<<·테스트 환경 JWT 서명용 Base64 인코딩된 비밀키 (기본값)·>>}  # 환경변수 없을 때 사용할 기본값으로 교체
```

---

## Firebase 설정

### 1. `FCMUtil/app/google-services.json`

```json
{
  "client": [
    {
      "api_key": [
        {
          "current_key": "<<·Firebase Android API 키·>>"  # Firebase 콘솔에서 발급받은 Android API 키로 교체
        }
      ]
    }
  ]
}
```

**설정 방법:**
1. Firebase 콘솔 (https://console.firebase.google.com) 접속
2. 프로젝트 선택
3. 프로젝트 설정 > 일반 탭
4. "내 앱" 섹션에서 Android 앱 선택
5. API 키 복사하여 위 위치에 입력

---

### 2. `walletslot-backend/src/main/resources/walletslot-9dc34-firebase-adminsdk-fbsvc-0a23894ecd.json`

```json
{
  "type": "service_account",
  "project_id": "walletslot-9dc34",
  "private_key_id": "<<·Firebase 서비스 계정 개인 키 ID·>>",  # Firebase 서비스 계정 키 ID로 교체
  "private_key": "<<·Firebase 서비스 계정 개인 키 (-----BEGIN PRIVATE KEY----- 부터 -----END PRIVATE KEY----- 까지, \\n은 실제 줄바꿈으로 변환)·>>",  # Firebase 서비스 계정 개인 키로 교체 (\\n을 실제 줄바꿈으로 변환)
  "client_email": "<<·Firebase 서비스 계정 이메일·>>",  # Firebase 서비스 계정 이메일로 교체
  "client_id": "<<·Firebase 서비스 계정 클라이언트 ID·>>",  # Firebase 서비스 계정 클라이언트 ID로 교체
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40walletslot-9dc34.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}
```

**설정 방법:**
1. Firebase 콘솔 접속
2. 프로젝트 설정 > 서비스 계정 탭
3. "새 비공개 키 생성" 클릭
4. 다운로드된 JSON 파일의 내용을 위 형식에 맞게 입력
5. **주의:** `private_key` 필드의 `\n`을 실제 줄바꿈으로 변환해야 함

---

## 데이터베이스 설정

### MySQL 연결 정보

각 환경별 설정 파일에서 다음 정보를 설정해야 합니다:

- **개발 환경** (`application-dev.yml`): 로컬 MySQL 서버 정보
- **테스트 환경** (`application-test.yml`): 테스트용 MySQL 서버 정보
- **운영 환경** (`application-prod.yml`): 환경 변수로 관리 (설정 파일에 직접 입력하지 않음)

---

## 배포 환경 설정

### `exec/README.md`

배포 시 필요한 환경 변수들:

```bash
# MySQL 설정
MYSQL_ROOT_PASSWORD=<<·MySQL root 비밀번호·>>  # MySQL root 계정 비밀번호로 교체
MYSQL_DATABASE=walletslotdb
MYSQL_USER=<<·MySQL 사용자명·>>  # MySQL 사용자명으로 교체 (예: "admin")
MYSQL_PASSWORD=<<·MySQL 사용자 비밀번호·>>  # MySQL 사용자 비밀번호로 교체

# Spring Boot 프로파일
SPRING_PROFILES_ACTIVE=prod

# Docker 레지스트리 설정
DOCKER_REGISTRY=docker.io
DOCKER_REGISTRY_IMAGE=docker.io/jeonhaeji/b108-container-registry
DOCKER_REGISTRY_PASSWORD=<<·Docker 레지스트리 비밀번호·>>  # Docker 레지스트리 비밀번호로 교체
DOCKER_REGISTRY_USER=jeonhaeji

# SSH 설정 (EC2 접속용)
SSH_PRIVATE_KEY=<<·EC2 접속용 SSH 개인 키 (RSA 형식, -----BEGIN RSA PRIVATE KEY----- 부터 -----END RSA PRIVATE KEY----- 까지)·>>  # EC2 접속용 SSH 개인 키로 교체

# Spring Boot 데이터소스 설정
SPRING_DATASOURCE_URL=jdbc:mysql://mysql-db:3306/walletslotdb?serverTimezone=UTC&useSSL=false&allowPublicKeyRetrieval=true
SPRING_DATASOURCE_USERNAME=${MYSQL_USER}
SPRING_DATASOURCE_PASSWORD=${MYSQL_PASSWORD}
```

**주의사항:**
- SSH 개인 키는 전체 키를 한 줄로 입력하거나, 여러 줄로 나누어 입력할 수 있습니다
- 환경 변수는 `.env` 파일이나 배포 환경의 환경 변수 설정에서 관리하는 것을 권장합니다

---

## 유틸리티 설정

### `utils/src/AESUtil.java`

```java
public class AESUtil {
    // Field
    public static String base64Key = "<<·AES 암호화용 Base64 인코딩된 키·>>";  # AES 암호화용 Base64 키로 교체
    public static SecretKey encryptionKey;
    // ... 나머지 코드
}
```

**설정 방법:**
1. 32바이트 (256비트) AES 키 생성
2. Base64로 인코딩
3. 위 위치에 입력

**키 생성 예시 (Java):**
```java
import javax.crypto.KeyGenerator;
import java.util.Base64;

KeyGenerator keyGenerator = KeyGenerator.getInstance("AES");
keyGenerator.init(256);
SecretKey key = keyGenerator.generateKey();
String base64Key = Base64.getEncoder().encodeToString(key.getEncoded());
System.out.println(base64Key);
```

---

## 보안 권장사항

1. **환경 변수 사용**: 가능한 한 민감 정보는 환경 변수로 관리하세요
2. **Git 제외**: `.env` 파일이나 민감 정보가 포함된 파일은 `.gitignore`에 추가하세요
3. **키 로테이션**: 정기적으로 API 키와 비밀키를 교체하세요
4. **접근 제한**: 민감 정보가 포함된 파일에 대한 접근 권한을 제한하세요
5. **암호화**: 프로덕션 환경에서는 민감 정보를 암호화하여 저장하세요

---

## 문제 해결

### JWT 키 생성 방법
```bash
# OpenSSL을 사용한 랜덤 키 생성
openssl rand -base64 32
```

### AES 키 생성 방법
```bash
# OpenSSL을 사용한 256비트 키 생성
openssl rand -base64 32
```

### Base64 인코딩/디코딩
```bash
# 인코딩
echo -n "your-secret-key" | base64

# 디코딩
echo "your-base64-string" | base64 -d
```

---

## 참고 자료

- [Spring Boot 외부화된 설정](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config)
- [Firebase Admin SDK 설정](https://firebase.google.com/docs/admin/setup)
- [MySQL 보안 모범 사례](https://dev.mysql.com/doc/refman/8.0/en/security.html)
