/**
 * 포맷팅 유틸리티
 */
export const format = {
  /**
   * 숫자를 통화 형식으로 포맷팅
   */
  currency(amount: number, showUnit = true): string {
    // NaN 체크
    if (isNaN(amount) || amount === null || amount === undefined) {
      return showUnit ? '0원' : '0';
    }
    
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
   * 계좌번호 포맷팅 (하이픈 구분)
   * @param accountNo 원본 계좌번호 (숫자만)
   * @param format 포맷 배열 (예: [3, 6, 2] -> 3자리-6자리-2자리)
   * @returns 포맷된 계좌번호 (예: "123-456789-01")
   */
  accountNumberWithFormat(accountNo: string, format: number[]): string {
    // 숫자만 추출
    const cleanNumber = accountNo.replace(/\D/g, '');
    
    let formatted = '';
    let startIndex = 0;
    
    for (let i = 0; i < format.length; i++) {
      const segmentLength = format[i];
      const segment = cleanNumber.slice(startIndex, startIndex + segmentLength);
      
      if (segment) {
        formatted += segment;
        // 마지막 세그먼트가 아니면 하이픈 추가
        if (i < format.length - 1) {
          formatted += '-';
        }
      }
      
      startIndex += segmentLength;
    }
    
    return formatted;
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
