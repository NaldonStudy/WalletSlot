# 스테이징(데이터 표준화/정제)

## 스테이징(staging) 빌드(통합본들을 입력으로)

* **입력 파일**: `_merged_csv/포털DB_merged.csv`, `기업DB_merged.csv`, `인허가DB_merged.csv`, `법인DB_merged.csv`, `마켓DB_merged.csv`
* **표준 스키마**:

  ```
  [region, source_db, merchant_code, name, address, ref_date, raw_category, category]
  ```
* **정규화/정제 내용**

  * **region 통일**: `REGION_VARIANTS`(서울/부산/...) 매핑

    * 기업DB처럼 region이 비어 있으면 **주소에서 추론**
  * **ref\_date**: 소스별 후보 컬럼(예: 등록일/업데이트날짜/업데이트) 중 **처음 채워지는 값**
  * **raw\_category**: 원본 업종/분류 문자열 유지
  * **category(JSON)**: `raw_category`를 **구분자 `, / · .`** 로 분리 → **중복 제거(순서 보존)** → JSON 배열 문자열로 저장
  * **이름 공백/결측 행 제거**(스테이징에서 실시)
* **출력**:

  * `staging_all.utf8.csv` (UTF-8 with BOM)
  * `staging_all.csv` (CP949)
