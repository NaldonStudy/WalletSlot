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
