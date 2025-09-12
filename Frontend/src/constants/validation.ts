// ===== 정규식 패턴 =====
export const REGEX_PATTERNS = {
  PHONE: /^01[0-9]-?[0-9]{4}-?[0-9]{4}$/,
  BIRTH_DATE: /^[0-9]{6}$/, // YYMMDD 형식
  ACCOUNT_NUMBER: /^[0-9]{10,14}$/,
  PASSWORD: /^[0-9]{6}$/, // PIN 6자리 숫자
  NAME: /^[가-힣a-zA-Z\s-]{2,20}$/, // 한글, 영문, 공백, 하이픈 허용
  VERIFICATION_CODE: /^[0-9]{6}$/, // 인증번호 6자리
  ACCOUNT_VERIFICATION_CODE: /^[0-9]{3}$/, // 계좌 인증 3자리 코드
} as const;
