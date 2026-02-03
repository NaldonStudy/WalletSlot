# 슬롯 분류

## 목표

* 여러 원천 데이터(마켓 / 법인 / 인허가 / 포털 / 기업)에서 수집한 **가맹점 데이터 표준화**
* **LLM 기반 슬롯(지출 카테고리) 분류 후 merchant_slot_decision에 반영

---

## 핵심 설계

* **2계층 구조**:

  1. **수집·통합 계층 (Staging)**
  2. **서빙 계층 (Service DB)**

---

## 데이터 흐름 (End-to-End)

**현재: 비용·지연 최적화 운용

```
원천 데이터
 └─> Staging (정규화 / 엔티티화)
      └─> (임시) Targets
           └─> LLM 분류 (JSON 강제)
                └─> Service DB (merchant_slot_decision load)
```

---

## Staging 계층

* **원본 처리**

  * 원본 엑셀 스캔
  * DB별 통합 CSV 생성 (`*_merged.csv`)
* **표준 스키마**

  * `[region, source_db, merchant_code, name, address, ref_date, raw_category, category(JSON)]`
* **정규화**

  * `name` → `normalize_name` (정제)
  * `category` → 토큰화 / 중복 제거 (JSON 배열)
* **unique_df 생성**

  * `name_clean` 기준 dedup
  * `name_idx` 부여
  * `merchant_category` 집계

---

## Targets (임시 레이어)

* **역할**: LLM 호출 대상을 필터링하는 완충층
* **방법**

  * 유사도 규칙 / 정규식 / `rapidfuzz` 적용

* **목적**

  * 토큰 비용 절감
  * 응답 지연 단축
  * LLM 오작동 시 영향 최소화

---

## LLM 분류

* **입력**: `(가맹점명, 카테고리 배열)`
* **출력**:

  ```json
  {"slot": "<슬롯명>"}
  ```
* **규칙**

  * 25개 슬롯 후보 중 1개 선택
  * JSON 형식 강제
  * 실패/불응답 시 → `"미분류"`로 폴백

---

## Service DB 반영(merchant_slot_decision)

* **업서트 기준**: `unique_df.name_idx`
* **저장 필드**: `slot_name`, `slot_id`
* **운영 방식**

  * 실제 서비스는 **Service DB만 참조**
  * Staging은 로컬 / 백오피스 운영용

---

## Targets 사용 이유?

* **현재 상황**: 시간·리소스(GMS 등) 제약
* **필요성**:

  * LLM 호출량 보수적 제한
  * 비용과 지연을 줄이기 위한 **임시 완충층**

---

서비스 DB는 항상 **정제된 슬롯 결과만** 참조하고, Staging과 LLM 레이어는 **운영 보조·백오피스
