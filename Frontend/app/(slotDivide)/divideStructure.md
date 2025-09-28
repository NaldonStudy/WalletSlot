(slotDivide)/    # 슬롯 추천 및 분배 화면들
├── _layout.tsx              # slotDivide 레이아웃
├── s1electDay.tsx           # ✅ 기준일 선택 화면
├── l2oading.tsx             # ✅ 슬롯 추천 로딩 화면
├── p3ermission.tsx          # ✅ 권한 동의 화면
├── i4nputIncome.tsx         # ✅ 월 수입 입력 화면
├── i5nputPeriod.tsx         # ✅ 분석 기간 선택 화면 ✅api 연동 5번
├── r6eady.tsx               # ✅ 추천 준비 완료 화면 ✅5-2번 응답에 따라서 에러 모달 or 거의 다됐어요! 6번
└── a7djustSlot.tsx          # 🚧 슬롯 조정 화면     ✅5-2번 응답 success 시, 추천 결과 ui에 표시 🚧 슬롯 추가, 삭제, 수정, 확정 api 연동 7번
 
## 화면 플로우 (파일명 숫자 순서)
1. s1electDay.tsx → 기준일 선택
2. i2oading.tsx → 슬롯 추천 로딩
3. p3ermission.tsx → 권한 동의
4. i4nputIncome.tsx → 월 수입 입력
5. i5nputPeriod.tsx → 분석 기간 선택
6. r6eady.tsx → 추천 준비 완료
7. a7djustSlot.tsx → 슬롯 조정 및 최종 확인

## api 연동 => 다 공통 헤더 쓸 것.
### 🔶5-1. 거래내역 3개월 이상 조회
```
[요청] GET /api/accounts/{accountId}/transactions/history/check
[응답]
{
    boolean "hasThreeMonthsHistory" : true
}
```
----
### 🔸(5-1)이 true : 

#### 🚧5-1-1. startDate, endDate로 응답하는 api
```
[요청] POST /api/accounts/{accountId}/slots/recommend
{
  "startDate": "string",
  "endDate": "string"
}
```
```
[응답]
{
  "success": true,
  "message": "string",
  "data": {
    "bank": {
      "bankId": "string",
      "name": "string",
      "color": "string"
    },
    "account": {
      "accountId": "string",
      "accountNo": "string",
      "accountBalance": 9007199254740991
    },
    "recommededSlots": [
      {
        "slotId": "string",
        "name": "string",
        "initialBudget": 9007199254740991
      }
    ]
  }
}
```
----
### 🔸(5-1)이 false : 
#### 🚧5-1-2. 기준점을 기반으로 응답하는 api

```
[요청] POST /api/accounts/{accountId}/slots/recommend/by-profile
{
  "useAge": true,
  "income": 9007199254740991,
  "useGender": true
}
```
```
[응답]
{
  "success": true,
  "message": "string",
  "data": {
    "bank": {
      "bankId": "string",
      "name": "string",
      "color": "string"
    },
    "account": {
      "accountId": "string",
      "accountNo": "string",
      "accountBalance": 9007199254740991
    },
    "recommededSlots": [
      {
        "slotId": "string",
        "name": "string",
        "initialBudget": 9007199254740991
      }
    ]
  }
}
```
----
### 🔶6-1. 5-1의 하위 api 연동이 완료되면 

**5-1-1의 성공 응답과 5-1-2의 성공 응답 모두 형식이 같음**

6번 화면에 50% 로딩 지나면 5-1번 응답에 따라 에러 모달(+뒤로 가기), 100%까지 로딩 완료 후 7번으로 이동해서 응답 온 것들 보여주기


---
### 🔶7. 슬롯 조정

#### 🔸7-1. 슬롯 삭제
```
[요청] DELETE /api/accounts/{accountId}/slots/{accountSlotId}
api에 accountId와 accountSlotId 담아 보내기
```

```
[응답]
{
  "success": true,
  "message": "string",
  "data": {
    "accountSlotId": "string"
  }
}
```

#### 🔸7-2. 슬롯 추가
```
[요청] POST /api/accounts/{accountId}/slots
api에 accountId 담아 보내기
{
  "slots": [
    {
      "slotId": "string",
      "customName": "string",
      "initialBudget": 9007199254740991,
      "isCustom": true
    }
  ]
}
```
```
[응답]
{
  "success": true,
  "message": "string",
  "data": {
    "slots": [
      {
        "accountSlotId": "string",
        "name": "string",
        "customName": "string",
        "initialBudget": 9007199254740991,
        "isSaving": true,
        "isCustom": true
      }
    ]
  }
}
```

#### 🔸7-3. 슬롯 수정
```
[요청] POST /api/accounts/{accountId}/slots/{accountSlotId}
api에 accountId와 accountSlotId 담아 보내기
{
  "customName": "string",
  "newBudget": 9007199254740991
}
```
```
[응답] 
{
  "success": true,
  "message": "string",
  "data": {
    "accountSlotId": "string",
    "customName": "string",
    "newBudget": 9007199254740991
  }
}
```

####🔸7-4. 예산안 확정
```
[요청] POST /api/accounts/{accountId}/slots/reassign
api에 accountId 담아보내기
{
  "slots": [
    {
      "slotId": "string",
      "customName": "string",
      "initialBudget": 9007199254740991,
      "isCustom": true
    }
  ]
}
```
```
[응답]
{
  "success": true,
  "message": "string",
  "data": {
    "slots": [
      {
        "accountSlotId": "string",
        "name": "string",
        "customName": "string",
        "initialBudget": 9007199254740991,
        "custom": true,
        "saving": true,
        "isSaving": true,
        "isCustom": true
      }
    ]
  }
}
