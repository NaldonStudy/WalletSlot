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
