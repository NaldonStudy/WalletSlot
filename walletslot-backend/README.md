<div align="center">

# 🔧 WalletSlot Backend

**Spring Boot 기반 RESTful API 서버**

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.5-6DB33F?logo=spring)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21-ED8B00?logo=java)](https://www.oracle.com/java/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-20.10-2496ED?logo=docker)](https://www.docker.com/)

</div>

---

## 📋 목차

- [프로젝트 소개](#-프로젝트-소개)
- [기술 스택](#-기술-스택)
- [프로젝트 구조](#-프로젝트-구조)
- [시작하기](#-시작하기)
- [API 문서](#-api-문서)
- [주요 기능](#-주요-기능)
- [데이터베이스](#-데이터베이스)

---

## 🎯 프로젝트 소개

WalletSlot Backend는 **Spring Boot 3.5.5**와 **Java 21**을 기반으로 개발된 RESTful API 서버입니다.

핀테크 서비스의 핵심 비즈니스 로직을 처리하며, 계좌 연동, 슬롯 관리, AI 리포트 생성, 푸시 알림 등 다양한 기능을 제공합니다.

### 주요 특징

- 🔒 **보안 강화**: Spring Security + JWT 기반 인증/인가
- 🏦 **금융 데이터 연동**: SSAFY 내부 금융망 API 통합
- 🤖 **AI 통합**: OpenAI, Naver CLOVA OCR 연동
- 🔔 **푸시 알림**: Firebase Cloud Messaging 지원
- 📊 **데이터 암호화**: AWS KMS를 활용한 계좌 정보 암호화
- 🐳 **컨테이너화**: Docker 기반 배포

---

## 🛠 기술 스택

### 핵심 프레임워크
| 기술 | 버전 | 용도 |
|:---:|:---:|:---|
| **Spring Boot** | 3.5.5 | 애플리케이션 프레임워크 |
| **Java** | 21 | 프로그래밍 언어 |
| **Spring Data JPA** | - | 데이터베이스 ORM |
| **Hibernate** | - | JPA 구현체 |

### 보안
| 기술 | 버전 | 용도 |
|:---:|:---:|:---|
| **Spring Security** | - | 인증/인가 프레임워크 |
| **Nimbus JOSE + JWT** | 9.37 | JWT 토큰 생성/검증 |
| **AWS KMS** | - | 키 관리 및 암호화 |

### 데이터베이스
| 기술 | 버전 | 용도 |
|:---:|:---:|:---|
| **MySQL** | 8.0 | 관계형 데이터베이스 |
| **Hibernate** | - | ORM 프레임워크 |

### API 문서
| 기술 | 버전 | 용도 |
|:---:|:---:|:---|
| **SpringDoc OpenAPI** | 2.8.6 | API 문서 자동 생성 (Swagger UI) |

### 외부 서비스 통합
| 서비스 | 용도 |
|:---:|:---|
| **OpenAI** | AI 리포트 생성, 소비 인사이트 분석 |
| **Naver CLOVA OCR** | 영수증 이미지 인식 |
| **Firebase Cloud Messaging** | 푸시 알림 발송 |
| **SSAFY 금융망 API** | 계좌 정보 조회 및 거래 내역 동기화 |

### 인프라
| 기술 | 용도 |
|:---:|:---|
| **Docker** | 컨테이너화 |
| **Docker Compose** | 멀티 컨테이너 오케스트레이션 |
| **AWS EC2** | 서버 인프라 |

---

## 📁 프로젝트 구조

```
walletslot-backend/
├── src/
│   ├── main/
│   │   ├── java/com/ssafy/b108/walletslot/backend/
│   │   │   ├── domain/              # 도메인별 모듈
│   │   │   │   ├── auth/           # 인증/인가
│   │   │   │   │   ├── controller/ # AuthController, SignupController
│   │   │   │   │   ├── service/    # AuthService
│   │   │   │   │   └── dto/        # DTO 클래스
│   │   │   │   ├── user/           # 사용자 관리
│   │   │   │   ├── account/        # 계좌 관리
│   │   │   │   ├── slot/           # 슬롯 관리
│   │   │   │   ├── transaction/   # 거래 내역
│   │   │   │   ├── ai_report/     # AI 리포트
│   │   │   │   ├── notification/  # 알림 관리
│   │   │   │   ├── ocr/           # OCR 기능
│   │   │   │   ├── consent_form/  # 동의서 관리
│   │   │   │   └── wishlist/      # 위시리스트
│   │   │   │   ├── config/        # 설정 클래스
│   │   │   │   │   ├── security/  # Spring Security 설정
│   │   │   │   │   ├── aws/       # AWS 설정
│   │   │   │   │   ├── jpa/       # JPA 설정
│   │   │   │   │   └── ...
│   │   │   │   ├── infrastructure/# 인프라 계층
│   │   │   │   │   ├── fcm/       # Firebase 연동
│   │   │   │   │   ├── mydata/    # 마이데이터 API
│   │   │   │   │   ├── sms/       # SMS 발송
│   │   │   │   │   └── scheduler/ # 스케줄러
│   │   │   │   ├── global/        # 전역 설정
│   │   │   │   │   ├── error/     # 에러 처리
│   │   │   │   │   ├── exception/ # 예외 클래스
│   │   │   │   │   └── response/  # 공통 응답 형식
│   │   │   │   └── common/        # 공통 유틸리티
│   │   │   └── resources/
│   │   │       ├── application-prod.yml  # 프로덕션 설정
│   │   │       └── application-test.yml   # 테스트 설정
│   │   └── test/              # 테스트 코드
│   └── build.gradle           # Gradle 빌드 설정
│   ├── Dockerfile            # Docker 이미지 빌드
│   └── settings.gradle       # Gradle 프로젝트 설정
```

### 아키텍처 패턴

- **레이어드 아키텍처**: Controller → Service → Repository
- **도메인 주도 설계 (DDD)**: 도메인별 모듈 분리
- **RESTful API**: REST 원칙 준수

---

## 🚀 시작하기

### Prerequisites

- **Java 21** 이상
- **Gradle** 8.x 이상 (또는 Gradle Wrapper 사용)
- **MySQL** 8.0
- **Docker** (선택사항, 로컬 DB 실행용)

### 로컬 개발 환경 설정

#### 1. 데이터베이스 설정

```bash
# Docker로 MySQL 실행
cd ../exec
docker-compose up -d

# 스키마 및 시드 데이터 적용
mysql -u root -p walletslotdb < schema.sql
mysql -u root -p walletslotdb < seed\ data.sql
```

#### 2. 환경 변수 설정

`src/main/resources/application-test.yml` 파일을 생성하고 다음 설정을 추가하세요:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/walletslotdb
    username: root
    password: your_password
  
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: true

# AWS KMS 설정
aws:
  kms:
    key-id: your-kms-key-id
    region: ap-northeast-2

# Firebase 설정
firebase:
  credentials-path: path/to/service-account.json

# OpenAI 설정
openai:
  api-key: your-openai-api-key

# Naver CLOVA 설정
naver:
  ocr:
    api-key: your-clova-api-key
    secret-key: your-clova-secret-key
```

#### 3. 애플리케이션 실행

```bash
# Gradle Wrapper 사용
./gradlew bootRun

# 또는 IDE에서 실행
# WalletslotBackendApplication.java 실행
```

### Docker로 실행

```bash
# Docker 이미지 빌드
docker build -t walletslot-backend .

# Docker Compose로 실행
cd ../exec
docker-compose up
```

---

## 📚 API 문서

### Swagger UI

애플리케이션 실행 후 다음 URL에서 API 문서를 확인할 수 있습니다:

```
http://localhost:8080/swagger-ui.html
```

### 주요 API 엔드포인트

#### 인증 (Auth)
- `POST /api/auth/login` - 로그인
- `POST /api/auth/login/full` - 전체 로그인 (Access + Refresh)
- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/refresh` - 토큰 갱신

#### 계좌 (Account)
- `POST /api/accounts` - 마이데이터 연동
- `GET /api/accounts/link` - 연동 계좌 목록 조회
- `GET /api/accounts/{accountId}` - 계좌 상세 조회

#### 슬롯 (Slot)
- `POST /api/accounts/{accountId}/slots/recommend` - 슬롯 추천
- `GET /api/accounts/{accountId}/slots` - 슬롯 목록 조회
- `PUT /api/accounts/{accountId}/slots/{slotId}` - 슬롯 수정

#### 거래 (Transaction)
- `GET /api/accounts/{accountId}/transactions` - 거래 내역 조회
- `POST /api/accounts/{accountId}/transactions/classify` - 거래 분류

#### AI 리포트
- `GET /api/accounts/{accountId}/ai-reports` - AI 리포트 조회

#### 알림 (Notification)
- `GET /api/notifications` - 알림 목록 조회
- `PATCH /api/notifications/{id}/read` - 알림 읽음 처리

#### 푸시 알림
- `POST /api/push/endpoints` - 푸시 엔드포인트 등록
- `GET /api/push/endpoints` - 푸시 엔드포인트 목록

---

## ✨ 주요 기능

### 🔐 인증 및 보안

- **JWT 기반 인증**: Access Token + Refresh Token
- **PIN 기반 로그인**: 6자리 PIN으로 안전한 인증
- **토큰 갱신**: Refresh Token을 통한 자동 토큰 갱신
- **계좌 정보 암호화**: AWS KMS를 활용한 계좌번호 암호화 저장

### 🏦 계좌 관리

- **마이데이터 연동**: SSAFY 내부 금융망 API를 통한 계좌 자동 연동
- **거래 내역 동기화**: 실시간 거래 내역 조회 및 저장
- **다중 계좌 지원**: 사용자별 여러 계좌 관리

### 💰 슬롯 관리

- **AI 기반 자동 추천**: 과거 소비 패턴 분석을 통한 슬롯 자동 분배
- **슬롯 CRUD**: 슬롯 생성, 조회, 수정, 삭제
- **예산 추적**: 실시간 예산 사용량 계산
- **예산 초과 알림**: 슬롯별 예산 초과 시 푸시 알림 발송

### 📊 거래 내역 관리

- **자동 거래 분류**: LLM 기반 가맹점 슬롯 자동 분류
- **거래 내역 조회**: 월별/일별 거래 내역 필터링
- **슬롯별 거래 현황**: 각 슬롯에 할당된 거래 내역 조회

### 🤖 AI 리포트

- **개인화된 인사이트**: OpenAI 기반 맞춤형 소비 분석 리포트
- **소비 패턴 분석**: 카테고리별 소비 트렌드 분석
- **절약 제안**: AI가 제안하는 효율적인 예산 관리 방법

### 🔔 알림 시스템

- **Firebase 푸시 알림**: 실시간 예산 초과 및 거래 알림
- **다양한 알림 타입**: 예산, 슬롯, 거래, 시스템 알림 지원
- **알림 히스토리**: 사용자별 알림 내역 저장 및 조회

### 📷 OCR 기능

- **영수증 인식**: Naver CLOVA OCR을 활용한 영수증 이미지 인식
- **거래 정보 추출**: 영수증에서 거래 정보 자동 추출

---

## 🗄 데이터베이스

### 주요 테이블

- **user**: 사용자 정보
- **account**: 계좌 정보
- **slot**: 슬롯 마스터 데이터
- **account_slot**: 계좌별 슬롯 할당
- **transaction**: 거래 내역
- **ai_report**: AI 리포트
- **notification**: 알림 내역
- **push_endpoint**: 푸시 알림 엔드포인트
- **merchant_slot_decision**: 가맹점-슬롯 매핑 (LLM 분류 결과)

### 데이터베이스 스키마

스키마 파일은 프로젝트 루트의 `schema.sql`을 참고하세요.

---

## 🧪 테스팅

```bash
# 단위 테스트 실행
./gradlew test

# 통합 테스트 실행
./gradlew integrationTest
```

---

## 🐳 Docker 배포

### Dockerfile

```dockerfile
FROM openjdk:21-jdk-slim
WORKDIR /app
COPY build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
    depends_on:
      - mysql
```

---

## 🔧 트러블슈팅

### 일반적인 문제

1. **포트 충돌**: `application.yml`에서 포트 변경
2. **데이터베이스 연결 오류**: MySQL 서버 실행 확인 및 연결 정보 확인
3. **JWT 토큰 오류**: 시크릿 키 설정 확인

---

## 📄 라이선스

이 프로젝트는 삼성 청년 SWㆍAI 아카데미 특화 프로젝트의 일환으로 개발되었습니다.

---

<div align="center">

**Made with ❤️ by Team B108 Backend Team**

</div>
