<div align="center">

# 💰 WalletSlot

### 빈틈 Zero 금융생활

**삼성 청년 SWㆍAI 아카데미 특화 프로젝트 (핀테크 트랙)**

[![React Native](https://img.shields.io/badge/React%20Native-0.81.4-61DAFB?logo=react)](https://reactnative.dev/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.5-6DB33F?logo=spring)](https://spring.io/projects/spring-boot)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql)](https://www.mysql.com/)
[![AWS](https://img.shields.io/badge/AWS-EC2-232F3E?logo=amazon-aws)](https://aws.amazon.com/)

</div>

---

## 📋 목차

- [프로젝트 소개](#-프로젝트-소개)
- [팀 소개](#-팀-소개)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [시스템 아키텍처](#-시스템-아키텍처)
- [프로젝트 구조](#-프로젝트-구조)
- [개발 기간](#-개발-기간)
- [시작하기](#-시작하기)

---

## 🎯 프로젝트 소개

### 프로젝트 목적

본인의 소비 지출에 대해 무뎌져 있는, 미리 계획하고 쓰지 않는 사람들을 위해 **자동 추천 및 수동으로 슬롯을 분리해주는 서비스**를 제공합니다.

### 프로젝트 개요

많은 사람들이 소비를 계획적으로 하지 않는다는 문제점을 인식했습니다. WalletSlot은 다음과 같은 솔루션을 제공합니다:

- ✨ **자동 슬롯 분배**: AI 기반 지출 패턴 분석을 통한 자동 예산 분배
- 📊 **시각화를 통한 분류 인지**: 직관적인 차트와 그래프로 소비 패턴 시각화
- 💡 **계획적인 소비습관 유도**: 슬롯별 예산 관리로 자발적인 소비 계획 수립
- 🏦 **SSAFY 내부 금융망 연동**: 실제 금융 환경과 유사한 경험 제공
- 💳 **계좌별 독립적인 통장 쪼개기**: 여러 계좌를 각각의 목적에 맞게 관리
- 🤖 **AI 레포트**: 개인화된 소비 인사이트 제공

---

## 👥 팀 소개

**팀 B108** | 삼성 청년 SWㆍAI 아카데미 특화 프로젝트

| 역할 | 이름 | 담당 |
|:---:|:---:|:---|
| 🎯 **팀장** | 전해지 | BE & Infra |
| 💻 **Backend** | 김도훈 | Backend |
| 🎨 **Frontend** | 이체라 | Frontend |
| 🎨 **Frontend** | 전지환 | Frontend |
| 🎨 **Frontend** | 조은경 | Frontend |
| 📊 **Data** | 안희은 | Data Analysis |

---

## ✨ 주요 기능

### 🔐 인증 및 보안
- **PIN 기반 인증**: 6자리 PIN으로 안전한 로그인
- **생체 인증**: 지문/얼굴 인식 지원
- **JWT 토큰 관리**: Access Token + Refresh Token 기반 인증
- **계좌 정보 암호화**: AWS KMS를 활용한 계좌번호 암호화 저장

### 🏦 계좌 관리
- **마이데이터 연동**: SSAFY 내부 금융망 API를 통한 계좌 자동 연동
- **다중 계좌 관리**: 여러 은행 계좌를 하나의 앱에서 통합 관리
- **실시간 잔액 조회**: 최신 계좌 잔액 및 거래 내역 동기화
- **계좌별 슬롯 분리**: 각 계좌마다 독립적인 예산 슬롯 설정

### 💰 슬롯 관리
- **AI 기반 자동 추천**: 과거 소비 패턴 분석을 통한 슬롯 자동 분배
- **수동 슬롯 조정**: 사용자 맞춤형 슬롯 생성 및 예산 조정
- **슬롯별 예산 추적**: 실시간 예산 사용량 및 달성률 모니터링
- **예산 초과 알림**: 슬롯별 예산 초과 시 푸시 알림 발송

### 📊 거래 내역 관리
- **자동 거래 분류**: LLM 기반 가맹점 슬롯 자동 분류
- **거래 내역 조회**: 월별/일별 거래 내역 필터링 및 검색
- **슬롯별 거래 현황**: 각 슬롯에 할당된 거래 내역 상세 조회
- **OCR 기능**: 영수증 촬영을 통한 거래 정보 자동 입력

### 📈 AI 리포트
- **개인화된 소비 인사이트**: OpenAI 기반 맞춤형 소비 분석 리포트
- **소비 패턴 분석**: 카테고리별 소비 트렌드 및 변화 추이 분석
- **절약 제안**: AI가 제안하는 효율적인 예산 관리 방법

### 🔔 알림 시스템
- **Firebase 푸시 알림**: 실시간 예산 초과 및 거래 알림
- **다양한 알림 타입**: 예산, 슬롯, 거래, 시스템 알림 지원
- **알림 설정 커스터마이징**: 사용자별 알림 수신 설정

### 🎁 위시리스트
- **소비 목표 관리**: 원하는 상품을 위시리스트에 추가
- **목표 달성 추적**: 슬롯 예산 절약을 통한 목표 달성 모니터링

---

## 🛠 기술 스택

### Frontend
| 카테고리 | 기술 |
|:---:|:---|
| **프레임워크** | React Native 0.81.4, Expo 54.0.8 |
| **언어** | TypeScript 5.9.2 |
| **상태 관리** | TanStack Query 5.87.4, Zustand 5.0.8 |
| **네비게이션** | Expo Router 6.0.7 |
| **UI/UX** | React Native Skia, Victory Native, React Hook Form |
| **푸시 알림** | Firebase Cloud Messaging v23 |
| **HTTP 클라이언트** | Axios 1.12.2 |

### Backend
| 카테고리 | 기술 |
|:---:|:---|
| **프레임워크** | Spring Boot 3.5.5 |
| **언어** | Java 21 |
| **데이터베이스** | MySQL 8.0 |
| **ORM** | Spring Data JPA, Hibernate |
| **보안** | Spring Security, JWT (Nimbus JOSE) |
| **API 문서** | SpringDoc OpenAPI 2.8.6 |
| **암호화** | AWS KMS |

### AI & 외부 서비스
| 서비스 | 용도 |
|:---:|:---|
| **OpenAI** | AI 리포트 생성, 소비 인사이트 분석 |
| **Naver CLOVA** | OCR 기능, 영수증 인식 |
| **Firebase** | 푸시 알림 서비스 |

### Infrastructure & DevOps
| 카테고리 | 기술 |
|:---:|:---|
| **클라우드** | AWS EC2 |
| **컨테이너** | Docker, Docker Compose |
| **웹 서버** | Nginx (리버스 프록시) |
| **CI/CD** | GitLab CI/CD, GitLab Runner |
| **컨테이너 레지스트리** | Docker Registry |

### Data Analysis
| 카테고리 | 기술 |
|:---:|:---|
| **언어** | Python |
| **LLM** | LLM 기반 가맹점 슬롯 분류 |
| **데이터 처리** | Pandas, 데이터 정규화 및 표준화 |

---

## 🏗 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                        Developer                             │
└──────────────────────┬──────────────────────────────────────┘
                       │ CI/CD
                       ▼
        ┌──────────────────────────────────┐
        │  GitLab → GitLab Runner          │
        │  → Docker Registry               │
        └──────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────┐
        │         EC2 Server                │
        │  ┌──────────────────────────────┐  │
        │  │      Docker Compose        │  │
        │  │  ┌──────────────────────┐ │  │
        │  │  │      Docker          │ │  │
        │  │  │  ┌──────────────┐    │ │  │
        │  │  │  │ Spring Boot  │    │ │  │
        │  │  │  └──────────────┘    │ │  │
        │  │  │  ┌──────────────┐    │ │  │
        │  │  │  │    MySQL     │    │ │  │
        │  │  │  └──────────────┘    │ │  │
        │  │  └──────────────────────┘ │  │
        │  └──────────────────────────────┘  │
        └──────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
┌──────────┐   ┌──────────┐   ┌──────────┐
│ OpenAI   │   │ CLOVA    │   │ Firebase │
└──────────┘   └──────────┘   └──────────┘
                       │
                       ▼
        ┌──────────────────────────────────┐
        │         User Device              │
        │  ┌──────────────────────────────┐ │
        │  │    React Native App         │ │
        │  └──────────────────────────────┘ │
        └──────────────────────────────────┘
                       ▲
                       │ Push Notification
                       │
        ┌──────────────┴──────────────┐
        │         Nginx                │
        │    (Reverse Proxy)           │
        └──────────────────────────────┘
```

---

## 📁 프로젝트 구조

```
WalletSlot/
├── Frontend/                 # React Native + Expo 프론트엔드
│   ├── app/                  # Expo Router 기반 화면 구성
│   │   ├── (auth)/           # 인증 관련 화면
│   │   ├── (tabs)/           # 메인 탭 네비게이션
│   │   │   ├── dashboard/    # 대시보드
│   │   │   ├── report/       # AI 리포트
│   │   │   ├── notifications/# 알림
│   │   │   ├── wishlist/     # 위시리스트
│   │   │   └── profile/      # 프로필
│   │   ├── (mydata)/         # 마이데이터 연동
│   │   ├── (slotDivide)/     # 슬롯 추천 및 분배
│   │   └── (onboarding)/     # 온보딩
│   ├── components/           # 재사용 가능한 컴포넌트
│   ├── src/                   # 소스 코드
│   │   ├── api/              # API 클라이언트
│   │   ├── hooks/            # 커스텀 훅
│   │   ├── store/            # 상태 관리
│   │   └── types/            # TypeScript 타입 정의
│   └── package.json
│
├── walletslot-backend/        # Spring Boot 백엔드
│   ├── src/
│   │   └── main/
│   │       └── java/com/ssafy/b108/walletslot/backend/
│   │           ├── domain/    # 도메인별 모듈
│   │           │   ├── auth/      # 인증
│   │           │   ├── user/     # 사용자
│   │           │   ├── account/  # 계좌
│   │           │   ├── slot/     # 슬롯
│   │           │   ├── transaction/ # 거래
│   │           │   ├── ai_report/   # AI 리포트
│   │           │   ├── notification/# 알림
│   │           │   └── ocr/        # OCR
│   │           ├── config/    # 설정
│   │           └── common/    # 공통 유틸리티
│   └── build.gradle
│
├── WalletSlot-Data/          # 데이터 분석
│   └── merchant-data/        # 가맹점 데이터 처리
│       ├── SlotClassify/     # LLM 기반 슬롯 분류
│       ├── RawData-Merge/    # 원본 데이터 통합
│       └── Build-Staging/    # 스테이징 데이터 구축
│
├── FCMUtil/                  # Firebase Cloud Messaging 유틸리티
├── exec/                     # 실행 스크립트 및 SQL
│   ├── schema.sql           # 데이터베이스 스키마
│   └── docker-compose.yml   # Docker Compose 설정
│
└── README.md
```

---

## 📅 개발 기간

**2025.08.25 ~ 2025.09.29** (약 5주)

---

## 🚀 시작하기

### Prerequisites

- **Node.js** 18.x 이상
- **Java** 21
- **MySQL** 8.0
- **Docker** & **Docker Compose**
- **Expo CLI**

### Frontend 실행

```bash
# Frontend 디렉토리로 이동
cd Frontend

# 의존성 설치
npm install

# 개발 서버 시작
npm start

# 또는 특정 플랫폼 실행
npm run android  # Android
npm run ios      # iOS
npm run web      # Web
```

### Backend 실행

```bash
# Backend 디렉토리로 이동
cd walletslot-backend

# Gradle 빌드
./gradlew build

# 애플리케이션 실행
./gradlew bootRun
```

### Database 설정

```bash
# Docker Compose로 MySQL 실행
cd exec
docker-compose up -d

# 스키마 및 시드 데이터 적용
mysql -u root -p walletslotdb < schema.sql
mysql -u root -p walletslotdb < seed\ data.sql
```

### 환경 변수 설정

백엔드와 프론트엔드 모두 환경 변수 설정이 필요합니다. 각 디렉토리의 `.env.example` 파일을 참고하여 `.env` 파일을 생성하세요.

---

## 📄 라이선스

이 프로젝트는 삼성 청년 SWㆍAI 아카데미 특화 프로젝트의 일환으로 개발되었습니다.

---

## 👨‍💻 기여자

팀 B108의 모든 멤버들에게 감사드립니다.

---

<div align="center">

**Made with ❤️ by Team B108**

</div>
