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

/**
 * 포맷팅 유틸리티
 */
export const format = {
  /**
   * 숫자를 통화 형식으로 포맷팅
   */
  currency(amount: number, showUnit = true): string {
    const formatted = new Intl.NumberFormat('ko-KR').format(amount);
    return showUnit ? `${formatted}원` : formatted;
  },

  /**
   * 휴대폰 번호 포맷팅 (010-1234-5678)
   */
  phone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{4})(\d{4})$/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
    return phone;
  },

  /**
   * 계좌번호 포맷팅 (마스킹 처리)
   */
  accountNumber(accountNumber: string, mask = true): string {
    if (!mask) return accountNumber;
    
    const cleaned = accountNumber.replace(/\D/g, '');
    if (cleaned.length < 8) return accountNumber;
    
    const start = cleaned.slice(0, 4);
    const end = cleaned.slice(-4);
    const middle = '*'.repeat(cleaned.length - 8);
    
    return `${start}${middle}${end}`;
  },

  /**
   * 날짜 포맷팅
   */
  date(date: string | Date, format = 'YYYY-MM-DD'): string {
    const d = new Date(date);
    
    if (format === 'YYYY-MM-DD') {
      return d.toISOString().split('T')[0];
    } else if (format === 'MM/DD') {
      return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
    } else if (format === 'YYYY.MM.DD') {
      return `${d.getFullYear()}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getDate().toString().padStart(2, '0')}`;
    }
    
    return d.toLocaleDateString('ko-KR');
  },

  /**
   * 시간 포맷팅
   */
  time(date: string | Date): string {
    const d = new Date(date);
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? '오후' : '오전';
    const displayHours = hours % 12 || 12;
    
    return `${ampm} ${displayHours}:${minutes.toString().padStart(2, '0')}`;
  },

  /**
   * 상대 시간 포맷팅 (방금, 1분 전, 1시간 전 등)
   */
  relativeTime(date: string | Date): string {
    const now = new Date();
    const target = new Date(date);
    const diffMs = now.getTime() - target.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return '방금';
    if (diffMin < 60) return `${diffMin}분 전`;
    if (diffHour < 24) return `${diffHour}시간 전`;
    if (diffDay < 7) return `${diffDay}일 전`;
    
    return format.date(date, 'MM/DD');
  },

  /**
   * 퍼센트 포맷팅
   */
  percentage(value: number, total: number): string {
    if (total === 0) return '0%';
    const percent = (value / total) * 100;
    return `${Math.round(percent)}%`;
  },
};

/**
 * 색상 유틸리티
 */
export const color = {
  /**
   * HEX 색상에 투명도 추가
   */
  addOpacity(hex: string, opacity: number): string {
    const alpha = Math.round(opacity * 255);
    return hex + alpha.toString(16).padStart(2, '0');
  },

  /**
   * 랜덤 색상 생성
   */
  random(): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
      '#FFEAA7', '#DDA0DD', '#98D8C8', '#F39C12'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  },

  /**
   * 색상의 밝기 계산
   */
  getBrightness(hex: string): number {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000;
  },

  /**
   * 텍스트 색상 결정 (밝은 배경: 검정, 어두운 배경: 흰색)
   */
  getTextColor(backgroundColor: string): string {
    return color.getBrightness(backgroundColor) > 128 ? '#000000' : '#FFFFFF';
  },
};

/**
 * 디바이스 유틸리티
 */
export const device = {
  /**
   * UUID 생성
   */
  generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  },

  /**
   * 플랫폼 감지
   */
  getPlatform(): 'ios' | 'android' | 'web' {
    // TODO: Platform API 사용
    return 'android';
  },
};

/**
 * 딥링크 유틸리티
 */
export const deepLink = {
  /**
   * URL에서 파라미터 추출
   */
  parseUrl(url: string): Record<string, string> {
    const params: Record<string, string> = {};
    const urlObj = new URL(url);
    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  },

  /**
   * 딥링크 URL 생성
   */
  createUrl(path: string, params?: Record<string, string>): string {
    const baseUrl = 'walletslot://';
    const searchParams = new URLSearchParams(params);
    return `${baseUrl}${path}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  },
};
