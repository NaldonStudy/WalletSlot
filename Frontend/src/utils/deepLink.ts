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
