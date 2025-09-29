# Merchant Data 적재

대용량 CSV(`staging_all.utf8.csv`)를 MySQL로 옮기기 위한 3단계 파이프라인입니다.

---

## 1️) 중복 검사 (Pre-check)

* `merchant_code` 컬럼을 기준으로 중복 여부를 확인합니다.
* 전체 행 수, 중복된 행 수, 중복된 코드 목록(Top 20), 중복 행 샘플을 점검합니다.
* 목적: **UNIQUE 제약 조건 충돌 방지**

---

## 2️) CSV 분할 (Split)

* 원본 CSV를 **5MB 단위**로 분할합니다.
* 출력 폴더: `_merged_csv/staging_all_split/`
* 결과 파일명: `staging_all.part001.csv`, `staging_all.part002.csv` …
* 특징:

  * 모든 파일에 **헤더 포함**
  * 줄바꿈은 CRLF(`\r\n`)
  * 인코딩은 `utf-8-sig`

---

## 3️) MySQL 병렬 적재 (Load)

### 테이블 스키마

* `staging_merchants` 테이블 사용
* 주요 컬럼: `merchant_code`, `name`, `category(JSON)`, `raw_category`, `region`, `address`, `source_date`, `source_db`, `ingested_at`
* `merchant_code`는 **UNIQUE 제약** 적용

### 적재 방식

* **SSH 터널링**으로 원격 서버 접속
* **멀티-VALUES INSERT** 사용 → 대량 삽입 최적화
* **파일 단위 COMMIT** → 성능과 안정성 균형
* **병렬 처리**: 최대 3개 파일 동시 적재 (ThreadPoolExecutor)

### 마커 파일 관리

* 성공 시: `.DONE` 파일 생성 → 재실행 시 스킵
* 실패 시: `.FAIL` 파일 생성 → 에러 로그 기록

### 실행 결과 예시

* 각 파일별 읽은 행 수 / 삽입된 행 수 / 처리 시간 출력
* 전체 합계 및 총 소요 시간 표시
