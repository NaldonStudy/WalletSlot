// ===== 슬롯 카테고리 관련 상수 =====
export const SLOT_CATEGORIES = {
  FOOD: { label: '식비', emoji: '🍽️', color: '#FF6B6B' },
  TRANSPORT: { label: '교통', emoji: '🚗', color: '#4ECDC4' },
  SHOPPING: { label: '쇼핑', emoji: '🛍️', color: '#45B7D1' },
  ENTERTAINMENT: { label: '엔터테인먼트', emoji: '🎮', color: '#96CEB4' },
  EDUCATION: { label: '교육', emoji: '📚', color: '#FFEAA7' },
  HEALTHCARE: { label: '의료', emoji: '🏥', color: '#DDA0DD' },
  SAVINGS: { label: '저축', emoji: '💰', color: '#98D8C8' },
  UNCATEGORIZED: { label: '미분류', emoji: '❓', color: '#95A5A6' },
  OTHER: { label: '기타', emoji: '📦', color: '#B0B0B0' },
} as const;
