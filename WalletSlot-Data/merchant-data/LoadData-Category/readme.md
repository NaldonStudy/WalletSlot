# 업종(카테고리) DB 적재

---

## 단계별 설명

### 1) **원본 CSV 스캔 → 고유 카테고리 수집**

* 입력: `staging_all.utf8.csv`의 `category` 컬럼(JSON 배열)
* 처리: 배열의 각 원소(업종명)를 **공백 제거 + 소문자**로 표준화한 뒤 **SHA1 해시 앞 12자리**를 `code`로 부여
* 결과: `(code → name)` 딕셔너리 형태로 **중복 제거된 카테고리 집합** 확보

  * 예) `"미용실"`과 `" 미 용 실 "`은 동일 카테고리로 인식

### 2) **`category_dim_seed.csv` 생성**

* 컬럼: `name, code`
* 용도: DB의 `category_dim` 테이블 초기 시드(source of truth)로 사용

### 3) **SSH 터널 → 원격 MySQL 접속**

* 외부에서 안전하게 내부 MySQL에 연결하기 위한 SSH 터널 사용
* 목적: 사내/서버망 정책을 지키면서 자동화 스크립트로 DB 접근

### 4) **`category_dim` 테이블 보장 및 업서트**

* 스키마(핵심):

  * `id (PK, AUTO_INCREMENT)`
  * `name` (업종명)
  * `code` (SHA1 12자리)
  * `updated_at` (업서트 시 갱신)
  * `uq_code`, `uq_name` 유니크
* 동작:

  * **INSERT … ON DUPLICATE KEY UPDATE**로 시드 파일의 모든 카테고리를 **재실행 가능(idempotent)** 하게 반영
  * 기존 레코드가 있으면 `updated_at`만 갱신

### 5) **DB의 `code → id` 매핑 조회**

* 이후 매핑 테이블에서 `category_id`로 사용할 안정적 키 확보

### 6) **`merchant_category_map_seed.csv` 생성**

* 원본 CSV를 다시 읽어 각 가맹점의 `category` 배열을 `code → id`로 치환
* 컬럼 예시:

  * `merchant_code_raw` (원문)
  * `merchant_code` (정규화)
  * `category_id` (FK to `category_dim.id`)
  * `category_name` (가독용)
  * `source_db` (출처 기록)
* 목적: **가맹점 ↔ 업종(다대다) 관계를 시드로 정리**해 후속 적재에 사용

### 7) **시드 파일 분할(5MB 기준)**

* 출력 디렉토리: `./_prepped/merchant_category_map_chunks/`
* 규칙: 모든 분할 파일에 **헤더 포함**, 용량 초과 시 새 파일
* 이유: **대용량 적재 안정성/성능** 확보 및 재시도 단위 최소화

### 8) **`merchant_category_map` 테이블에 일괄 적재**

* 스키마(핵심):

  * `id (PK)`
  * `merchant_code` (FK → `staging_merchants.merchant_code`)
  * `category_id` (FK → `category_dim.id`)
  * `UNIQUE(merchant_code, category_id)` (중복 관계 방지)
* 동작:

  * 파일 단위 트랜잭션(한 파일 1회 `COMMIT`)
  * **Multi-VALUES INSERT**로 성능 최적화
  * **INSERT IGNORE**로 중복 관계는 조용히 스킵

### 9) **마커 파일로 재실행 방지**

* 각 분할 파일 적재 완료 시 `.done` 생성 → 다음 실행 때 자동 스킵
* 실패 시에는 `.fail`(또는 로그)로 원인 추적 → **장애 복구 용이**

---

## 왜 이 파이프라인이 필요한가? (핵심 목적/효과)

### 1) **정규화와 일관된 키 관리**

* 업종 문자열은 **표기 흔들림**이 잦습니다.

  * 예: “카페”, “카 페”, “Cafe”, “CAFE”
* \*\*공백 제거 + 소문자 + SHA1(12자)\*\*로 **결정적 코드**를 만들면,

  * 카테고리 **중복/변형**을 안정적으로 흡수
  * 서비스 전반에서 **동일 키로 참조**(API/DB/분석)의 일관성 확보

### 2) **다대다 관계의 선정리 → 후속 로직 단순화**

* 하나의 가맹점이 **여러 업종 후보**를 가질 수 있음

  * 가맹점–업종을 **선행 매핑 테이블**로 분리하면,
  * 이후 “슬롯 분류(식비/카페/… )” 단계는 **업종 집합**을 바로 이용
  * 룰/LLM이 업종 기반으로 더 쉽게 **1차 분류/보정** 가능

### 3) **성능·안정성·운영성**

* **분할(5MB)** + **Multi-VALUES** + **파일 단위 COMMIT** → 대량 적재 속도/안정성 향상
* **마커 파일**로 재시도와 실패 복구가 쉬움
* **업서트**로 재실행 가능(idempotent) → 운영 자동화에 적합

### 4) **감사·추적 가능성(데이터 거버넌스)**

* `source_db`, `updated_at`으로 **출처/갱신 히스토리** 확인
* 이후 오류 정정, 품질 개선, 리플로우 시 **근거 데이터 확보**

### 5) **다운스트림(슬롯/리포트/추천) 품질 향상**

* 깨끗한 카테고리 차원과 안정적 참조키는,

  * **슬롯 매핑 정확도**(룰/LLM/브랜드 보정)
  * **사용자 리포트 품질**(슬롯별 지출 분석, 예산 추천)
  * **테스트 재현성**(시뮬/AB 실험)
    를 모두 끌어올립니다.

---

## 운영 체크리스트

* 데이터 전:

  * `staging_all.utf8.csv`의 `category`가 **유효 JSON 배열**인지 표본 점검
  * `merchant_code` **NULL/공백** 여부 사전 필터링
* 적재 전:

  * DB 연결/권한, FK 대상(`staging_merchants`, `category_dim`) 존재 확인
  * `max_allowed_packet` 등 MySQL 파라미터 점검(대량 INSERT 대비)
* 적재 중/후:

  * 실패 파일 `.fail`/로그 확인 → 원인(인코딩/CSV 컬럼 누락/FK 위반 등) 처리
  * 중복 비율, FK 미일치(고아 레코드) 여부 점검
  * 성능 병목 시 **배치 크기/동시성/인덱스 상태** 조정

---

## 산출물 요약

* `category_dim_seed.csv` : 업종 차원 시드
* `merchant_category_map_seed.csv` : 가맹점–업종 관계 시드
* `merchant_category_map_part_*.csv` : 5MB 분할 파일들
* DB 반영:

  * `category_dim`(업서트로 최신화)
  * `merchant_category_map`(UNIQUE(merchant\_code, category\_id) 보장)
