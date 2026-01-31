<div align="center">

# 💰 WalletSlot

### 빈틈 Zero 금융생활

**계획적인 소비습관을 위한 통장 쪼개기 서비스**

삼성 청년 SWㆍAI 아카데미 특화 프로젝트 (핀테크 트랙) | B108

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**프로젝트 기간**: 2025.08.25 ~ 2025.09.29 (약 5주)

</div>

---

## 📋 목차

- [프로젝트 소개](#-프로젝트-소개)
- [팀 구성](#-팀-구성)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [시스템 아키텍처](#-시스템-아키텍처)
- [프로젝트 구조](#-프로젝트-구조)
- [시작하기](#-시작하기)
- [문서](#-문서)

---

## 🎯 프로젝트 소개

### 문제 인식

많은 사람들이 소비를 계획적으로 하지 않아, 지출에 대해 무뎌지고 미리 계획하고 쓰지 않는 문제가 있습니다.

### 해결 방안

WalletSlot은 **자동 슬롯 분배**와 **시각화**를 통해 사용자가 소비를 분류하고 인지할 수 있도록 돕고, **계획적인 소비습관**을 유도합니다.

### 핵심 가치

- 🏦 **실제 금융 환경 경험**: SSAFY 내부 금융망으로 실제 금융 환경과 비슷한 경험 제공
- 💳 **독립적인 통장 쪼개기**: 계좌별 독립적인 슬롯 관리로 예산 분리
- 🤖 **AI 기반 인사이트**: AI 레포트를 통한 정리된 소비 정보 제공
- 📊 **직관적인 시각화**: 한눈에 보는 소비 패턴과 예산 현황

---

## 👥 팀 구성

| 역할 | 이름 | 담당 |
|:---:|:---:|:---|
| 🎯 **팀장** | 전해지 | Infra & Backend |
| 💻 **Backend** | 김도훈 | Backend Development |
| 🎨 **Frontend** | 조은경 | Frontend Development |
| 🎨 **Frontend** | 전지환 | Frontend Development |
| 🎨 **Frontend** | 이체라 | Frontend Development |
| 📊 **Data** | 안희은 | Data Analysis |

---

## ✨ 주요 기능

### 1. 자동 슬롯 분배
- 거래 내역을 분석하여 자동으로 적절한 슬롯에 분배
- 사용자 확인 후 수정 가능

### 2. 수동 슬롯 관리
- 사용자가 직접 슬롯을 생성하고 관리
- 예산 설정 및 조정 기능

### 3. 계좌별 독립 관리
- 여러 계좌를 등록하고 각각 독립적으로 슬롯 관리
- 계좌별 예산 및 지출 현황 확인

### 4. AI 소비 레포트
- OpenAI를 활용한 월별 소비 패턴 분석
- 맞춤형 소비 권장사항 제공

### 5. 실시간 알림
- 예산 초과 알림
- 미분류 거래 알림
- FCM을 통한 푸시 알림

### 6. 영수증 OCR
- 네이버 OCR을 활용한 영수증 자동 인식
- 거래 내역 자동 입력

---

## 🛠 기술 스택

### Backend Framework & Language
| 기술 | 버전 | 용도 |
|:---|:---:|:---|
| **Spring Boot** | 3.5.5 | 메인 프레임워크 |
| **Java** | 21 | 개발 언어 |
| **Gradle** | 8.0+ | 빌드 도구 |
| **Spring Data JPA** | - | ORM 및 데이터 접근 계층 |
| **Hibernate** | - | JPA 구현체 |
| **Spring Security** | - | 인증/인가 프레임워크 |
| **Spring WebFlux** | - | 비동기 HTTP 클라이언트 (외부 API 호출) |
| **SpringDoc OpenAPI** | 2.8.6 | API 문서화 (Swagger UI) |
| **Spring Actuator** | - | 애플리케이션 모니터링 |

### Database & Persistence
| 기술 | 버전 | 용도 |
|:---|:---:|:---|
| **MySQL** | 8.0+ | 관계형 데이터베이스 |
| **Hibernate** | - | JPA 구현체, 쿼리 최적화 |
| **Hypersistence Utils** | 3.8.2 | Hibernate 유틸리티 |

### Security & Authentication
| 기술 | 용도 |
|:---|:---|
| **JWT (Nimbus JOSE)** | Access Token / Refresh Token 기반 인증 |
| **BCrypt** | 비밀번호 해싱 (Cost Factor: 12) |
| **AES-256** | 계좌번호 등 민감 정보 암호화 |
| **Pepper** | 비밀번호 추가 보안 레이어 (AWS KMS 통합) |
| **Device Binding** | 디바이스별 토큰 바인딩 및 검증 |
| **Refresh Token Rotation** | 토큰 재사용 방지 및 보안 강화 |

### Cloud & Infrastructure
| 서비스 | 용도 |
|:---|:---|
| **AWS EC2** | 애플리케이션 서버 호스팅 |
| **AWS KMS** | 암호화 키 관리 (Pepper, 비밀번호 암호화) |
| **Docker** | 컨테이너화 |
| **Docker Compose** | 로컬 개발 환경 구성 |
| **GitLab CI/CD** | 자동 빌드 및 배포 파이프라인 |

### External APIs & Services
| 서비스 | 용도 |
|:---|:---|
| **SSAFY 금융망 API** | 실제 금융 거래 내역 조회, 계좌 인증 |
| **OpenAI API** | AI 기반 소비 패턴 분석 및 레포트 생성 |
| **Naver OCR API** | 영수증 이미지 텍스트 추출 |
| **Aligo SMS API** | OTP 인증 코드 발송 |
| **Firebase Cloud Messaging (FCM)** | 푸시 알림 전송 |

### Development & Tools
| 도구 | 용도 |
|:---|:---|
| **Lombok** | 보일러플레이트 코드 감소 |
| **Jackson** | JSON 직렬화/역직렬화 |
| **Google Auth Library** | Firebase 인증 토큰 발급 |

---

## 🏗 시스템 아키텍처

### 아키텍처 패턴

#### 1. **Domain-Driven Design (DDD)**
프로젝트는 도메인 중심 설계를 따르며, 비즈니스 로직을 도메인별로 분리합니다.

```
domain/
├── account/          # 계좌 도메인
├── auth/             # 인증/인가 도메인
├── transaction/      # 거래 내역 도메인
├── slot/             # 슬롯 관리 도메인
├── ai_report/        # AI 레포트 도메인
├── notification/     # 알림 도메인
└── ...
```

각 도메인은 독립적인 패키지로 구성되며, 다음 레이어를 포함합니다:
- **Entity**: 도메인 모델
- **Repository**: 데이터 접근 계층
- **Service**: 비즈니스 로직
- **Controller**: API 엔드포인트
- **DTO**: 데이터 전송 객체

#### 2. **Infrastructure Layer**
외부 서비스 연동은 Infrastructure 레이어에서 처리합니다.

```
infrastructure/
├── ssafy/            # SSAFY 금융망 API 클라이언트
├── fcm/              # Firebase Cloud Messaging
├── sms/              # SMS 발송 (Aligo)
└── scheduler/        # 스케줄러 (AI 리포트 배치)
```

#### 3. **Layered Architecture**
```
┌─────────────────────────────────────┐
│         Presentation Layer          │
│    (REST Controllers / DTOs)        │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│         Application Layer            │
│      (Service / Business Logic)      │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│         Domain Layer                │
│    (Entities / Domain Models)       │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│      Infrastructure Layer            │
│  (Repository / External Services)    │
└─────────────────────────────────────┘
```

### 인증/인가 아키텍처

#### JWT 기반 인증 플로우

```
1. 사용자 로그인
   ↓
2. PIN 검증 (BCrypt + Pepper)
   ↓
3. Access Token 발급 (24시간 유효)
   ↓
4. Refresh Token 발급 (30일 유효, DB 저장)
   ↓
5. API 요청 시 Access Token 검증
   ↓
6. Access Token 만료 시 Refresh Token으로 갱신
   ↓
7. Refresh Token Rotation (재사용 방지)
```

#### Device Binding
- 각 디바이스는 고유한 `deviceId`를 가집니다
- JWT 토큰에 `deviceId`가 포함되어 바인딩됩니다
- 토큰 탈취 시 다른 디바이스에서 사용 불가

#### 보안 계층
1. **비밀번호 보호**: BCrypt (Cost 12) + Pepper (AWS KMS)
2. **민감 정보 암호화**: AES-256 (계좌번호 등)
3. **토큰 보안**: JWT 서명 검증, 만료 시간 체크
4. **키 관리**: AWS KMS를 통한 중앙화된 키 관리

### 데이터베이스 설계

#### 주요 테이블 구조
- **user**: 사용자 정보
- **account**: 계좌 정보 (암호화된 계좌번호)
- **account_slot**: 계좌별 슬롯 관리
- **transaction**: 거래 내역
- **slot**: 슬롯 카테고리
- **refresh_token**: Refresh Token 관리 (회전 추적)
- **pepper_keys**: Pepper 키 버전 관리
- **ai_report**: AI 레포트 (JSON 형식)
- **notification**: 알림 정보

#### 관계형 설계
- 사용자 ↔ 계좌: 1:N
- 계좌 ↔ 슬롯: N:M (account_slot 중간 테이블)
- 거래 ↔ 슬롯: N:1
- 인덱스 최적화: 거래 조회 성능 향상

### 외부 서비스 통합

#### 1. SSAFY 금융망 API
- 계좌 목록 조회
- 거래 내역 조회
- 계좌 잔액 조회
- 계좌 인증 (1원 인증)

#### 2. OpenAI API
- 월별 소비 패턴 분석
- 맞춤형 소비 권장사항 생성
- 스케줄러를 통한 배치 처리

#### 3. Naver OCR API
- 영수증 이미지 업로드
- 텍스트 추출 및 파싱
- 거래 내역 자동 생성

#### 4. Firebase Cloud Messaging
- 예산 초과 알림
- 미분류 거래 알림
- 실시간 푸시 알림

### 배포 아키텍처

```
┌─────────────────────────────────────────┐
│         GitLab Repository               │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│         GitLab CI/CD Pipeline           │
│  - Build Docker Image                   │
│  - Push to Docker Registry              │
│  - Deploy to EC2                        │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│         AWS EC2                          │
│  ┌──────────────┐  ┌──────────────┐    │
│  │ Backend App   │  │  MySQL DB    │    │
│  │ (Docker)      │  │  (Docker)    │    │
│  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│         External Services               │
│  - SSAFY Finance API                    │
│  - OpenAI API                           │
│  - Naver OCR                            │
│  - Firebase FCM                         │
│  - AWS KMS                              │
└─────────────────────────────────────────┘
```

### 비동기 처리

- **Spring WebFlux**: 외부 API 호출 시 비동기 처리
- **스케줄러**: AI 레포트 생성 (매일 자정 실행)
- **FCM**: 푸시 알림 비동기 전송

---

## 📁 프로젝트 구조

### 전체 구조

```
WalletSlot/
├── walletslot-backend/              # Spring Boot Backend 애플리케이션
│   ├── src/main/java/
│   │   └── com/ssafy/b108/walletslot/backend/
│   │       ├── config/              # 설정 클래스
│   │       │   ├── security/        # Spring Security 설정
│   │       │   ├── aws/             # AWS KMS 설정
│   │       │   ├── jpa/             # JPA 설정
│   │       │   ├── web/             # WebMvc, WebClient 설정
│   │       │   └── openapi/         # Swagger 설정
│   │       │
│   │       ├── domain/              # 도메인별 비즈니스 로직 (DDD 패턴)
│   │       │   ├── account/         # 계좌 관리
│   │       │   │   ├── controller/  # REST API 엔드포인트
│   │       │   │   ├── service/     # 비즈니스 로직
│   │       │   │   ├── repository/  # 데이터 접근 계층
│   │       │   │   ├── entity/      # JPA 엔티티
│   │       │   │   └── dto/         # 데이터 전송 객체
│   │       │   │
│   │       │   ├── auth/            # 인증/인가
│   │       │   │   ├── controller/  # 로그인, 회원가입, OTP
│   │       │   │   ├── service/     # 인증 로직, 토큰 관리
│   │       │   │   ├── repository/  # 사용자, 토큰 저장소
│   │       │   │   └── entity/      # User, RefreshToken 등
│   │       │   │
│   │       │   ├── transaction/     # 거래 내역
│   │       │   │   ├── service/     # 거래 조회, 분배 로직
│   │       │   │   └── dto/         # 거래 관련 DTO
│   │       │   │
│   │       │   ├── slot/            # 슬롯 관리
│   │       │   │   ├── service/     # 슬롯 추천, 예산 관리
│   │       │   │   └── entity/      # Slot, AccountSlot
│   │       │   │
│   │       │   ├── ai_report/       # AI 레포트
│   │       │   │   ├── batch/       # 스케줄러 (월별 리포트 생성)
│   │       │   │   └── service/     # OpenAI 연동
│   │       │   │
│   │       │   ├── notification/   # 알림
│   │       │   │   ├── service/     # 알림 생성, 전송
│   │       │   │   └── entity/      # Notification, PushEndpoint
│   │       │   │
│   │       │   └── ocr/             # 영수증 OCR
│   │       │       ├── client/      # Naver OCR 클라이언트
│   │       │       └── service/     # OCR 처리 로직
│   │       │
│   │       ├── infrastructure/       # 외부 서비스 연동
│   │       │   ├── ssafy/           # SSAFY 금융망 API 클라이언트
│   │       │   ├── fcm/             # Firebase Cloud Messaging
│   │       │   └── sms/             # SMS 발송 (Aligo)
│   │       │
│   │       ├── global/              # 전역 설정
│   │       │   ├── crypto/          # 암호화 유틸리티
│   │       │   │   ├── PepperedPasswordEncoder
│   │       │   │   ├── PepperSecretProvider (AWS KMS)
│   │       │   │   └── RtHasher (Refresh Token 해싱)
│   │       │   ├── exception/       # 전역 예외 처리
│   │       │   └── response/        # 공통 응답 형식
│   │       │
│   │       └── common/              # 공통 유틸리티
│   │           └── util/            # AESUtil, LocalDateTimeFormatter 등
│   │
│   └── src/main/resources/
│       ├── application.yml           # 기본 설정
│       ├── application-dev.yml      # 개발 환경
│       ├── application-prod.yml     # 운영 환경
│       └── application-test.yml     # 테스트 환경
│
├── FCMUtil/                         # Firebase Cloud Messaging Android 유틸리티
│   └── app/                         # Android 앱 (FCM 토큰 테스트용)
│
├── utils/                           # 공통 유틸리티
│   ├── AESUtil.java                 # AES 암호화 유틸리티
│   └── UUIDGenerator.java           # UUID 생성 유틸리티
│
├── exec/                            # 실행 스크립트 및 설정
│   ├── schema.sql                  # 데이터베이스 스키마
│   ├── seed data.sql               # 시드 데이터 (테스트용)
│   └── docker-compose.yml          # Docker Compose 설정
│
├── docs/                            # 프로젝트 문서
│   └── SENSITIVE_INFO_SETUP.md     # 민감 정보 설정 가이드
│
└── README.md                        # 프로젝트 메인 문서
```

### 주요 패키지 설명

#### `config/`
애플리케이션 전반의 설정을 관리합니다.
- **security/**: Spring Security, JWT 필터, CORS 설정
- **aws/**: AWS KMS 클라이언트 설정
- **jpa/**: JPA/Hibernate 설정
- **web/**: WebMvc, WebClient (비동기 HTTP) 설정

#### `domain/`
도메인별 비즈니스 로직을 담당합니다. 각 도메인은 독립적인 패키지로 구성됩니다.
- **account/**: 계좌 등록, 조회, 인증
- **auth/**: 회원가입, 로그인, OTP 인증, 토큰 관리
- **transaction/**: 거래 내역 조회, 슬롯 분배
- **slot/**: 슬롯 관리, 예산 설정, AI 추천
- **ai_report/**: OpenAI를 활용한 월별 리포트 생성
- **notification/**: 알림 생성 및 FCM 전송
- **ocr/**: 영수증 OCR 처리

#### `infrastructure/`
외부 서비스와의 연동을 담당합니다.
- **ssafy/**: SSAFY 금융망 API 클라이언트
- **fcm/**: Firebase Cloud Messaging 서비스
- **sms/**: SMS 발송 서비스 (Aligo)

#### `global/`
전역 설정 및 공통 기능을 제공합니다.
- **crypto/**: 암호화 관련 유틸리티 (Pepper, BCrypt, AES)
- **exception/**: 전역 예외 처리 핸들러
- **response/**: 공통 API 응답 형식

### 환경별 설정

프로젝트는 환경별로 분리된 설정 파일을 사용합니다:

- **application.yml**: 공통 설정
- **application-dev.yml**: 개발 환경 (로컬 개발)
- **application-prod.yml**: 운영 환경 (AWS EC2)
- **application-test.yml**: 테스트 환경

각 환경별로 데이터베이스 연결 정보, API 키, 보안 설정 등을 분리하여 관리합니다.

---

## 🚀 시작하기

### 사전 요구사항

- Java 21 이상
- MySQL 8.0 이상
- Docker & Docker Compose (선택사항)
- Gradle 8.0 이상

### 환경 설정

1. **저장소 클론**
```bash
git clone <repository-url>
cd WalletSlot
```

2. **데이터베이스 설정**
```bash
# MySQL 데이터베이스 생성
mysql -u root -p < exec/schema.sql

# 시드 데이터 삽입 (선택사항)
mysql -u root -p walletslotdb < exec/seed\ data.sql
```

3. **환경 변수 설정**

`walletslot-backend/src/main/resources/application-dev.yml` 파일을 참고하여 필요한 환경 변수를 설정하세요.

주요 설정 항목:
- 데이터베이스 연결 정보
- JWT 시크릿 키
- 외부 API 키 (SSAFY 금융, OpenAI, Aligo, Naver OCR 등)
- Firebase 설정

자세한 내용은 [민감 정보 설정 가이드](docs/SENSITIVE_INFO_SETUP.md)를 참고하세요.

4. **애플리케이션 실행**

```bash
cd walletslot-backend
./gradlew bootRun
```

또는 Docker Compose를 사용:

```bash
cd exec
docker-compose up -d
```

### API 문서

애플리케이션 실행 후 다음 URL에서 API 문서를 확인할 수 있습니다:

```
http://localhost:8080/swagger-ui
```

---

## 📚 문서

- [민감 정보 설정 가이드](docs/SENSITIVE_INFO_SETUP.md) - 프로젝트 설정 시 필요한 민감 정보 설정 방법

---

## 📄 라이선스

이 프로젝트는 삼성 청년 SWㆍAI 아카데미 특화 프로젝트의 일환으로 개발되었습니다.

---

<div align="center">

**Made with ❤️ by B108 Team**

</div>
