// ===== 에러 메시지 =====
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
  SERVER_ERROR: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  INVALID_PHONE: '올바른 휴대폰 번호를 입력해주세요.',
  INVALID_BIRTH_DATE: '주민등록번호 앞 6자리를 입력해주세요.',
  INVALID_ACCOUNT: '올바른 계좌번호를 입력해주세요.',
  INVALID_PASSWORD: '6자리 숫자를 입력해주세요.',
  INVALID_NAME: '2-20자의 이름을 입력해주세요. (한글, 영문, 공백, 하이픈 가능)',
  INVALID_VERIFICATION_CODE: '6자리 인증번호를 입력해주세요.',
  INVALID_ACCOUNT_VERIFICATION_CODE: '3자리 계좌 인증번호를 입력해주세요.',
  PASSWORD_MISMATCH: '비밀번호가 일치하지 않습니다.',
  LOGIN_FAILED: '로그인에 실패했습니다.',
  BUDGET_EXCEEDED: '예산을 초과했습니다.',
  REQUIRED_FIELD: '필수 입력 항목입니다.',
  PHONE_VERIFICATION_FAILED: '휴대폰 인증에 실패했습니다.',
  ACCOUNT_VERIFICATION_FAILED: '계좌 인증에 실패했습니다.',
  INSUFFICIENT_SAVINGS: '지난달 절약금액 이상으로 예산을 늘릴 수 없어요.',
} as const;
