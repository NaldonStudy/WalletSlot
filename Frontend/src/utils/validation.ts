import { REGEX_PATTERNS } from '../constants';

/**
 * 유효성 검사 유틸리티
 */
export const validation = {
  /**
   * 휴대폰 번호 유효성 검사
   */
  isValidPhone(phone: string): boolean {
    return REGEX_PATTERNS.PHONE.test(phone.replace(/-/g, ''));
  },

  /**
   * 주민등록번호 앞자리 유효성 검사
   */
  isValidBirthDate(birthDate: string): boolean {
    return REGEX_PATTERNS.BIRTH_DATE.test(birthDate);
  },

  /**
   * 계좌번호 유효성 검사
   */
  isValidAccountNumber(accountNumber: string): boolean {
    return REGEX_PATTERNS.ACCOUNT_NUMBER.test(accountNumber.replace(/-/g, ''));
  },

  /**
   * 간편 비밀번호 유효성 검사
   */
  isValidPassword(password: string): boolean {
    return REGEX_PATTERNS.PASSWORD.test(password);
  },

  /**
   * 이름 유효성 검사
   */
  isValidName(name: string): boolean {
    return REGEX_PATTERNS.NAME.test(name);
  },

  /**
   * 이메일 유효성 검사
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
};
