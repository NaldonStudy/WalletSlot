// ===== 소득 구간 관련 상수 =====
export const INCOME_LEVELS = {
  UNDER_100: { label: '100만원 이하', min: 0, max: 100 },
  '100_200': { label: '100만원 - 200만원', min: 100, max: 200 },
  '200_300': { label: '200만원 - 300만원', min: 200, max: 300 },
  '300_400': { label: '300만원 - 400만원', min: 300, max: 400 },
  '400_500': { label: '400만원 - 500만원', min: 400, max: 500 },
  OVER_500: { label: '500만원 이상', min: 500, max: Infinity },
} as const;
