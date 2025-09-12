// ===== 은행 로고 이미지 로더 =====
const getBankLogo = (bankName: string) => 
  require(`../assets/images/banks/${bankName}.png`);

// ===== 은행 코드 상수 =====
export const BANK_CODES = {
  '001': { name: '한국은행', shortName: '한은', color: '#0057B8', logo: getBankLogo('한국은행') },
  '002': { name: '산업은행', shortName: '산업', color: '#183F6E', logo: getBankLogo('산업은행') },
  '003': { name: '기업은행', shortName: '기업', color: '#004080', logo: getBankLogo('기업은행') },
  '004': { name: '국민은행', shortName: '국민', color: '#5F6062', logo: getBankLogo('국민은행') },
  '011': { name: '농협은행', shortName: '농협', color: '#00B140', logo: getBankLogo('농협은행') },
  '020': { name: '우리은행', shortName: '우리', color: '#007BC1', logo: getBankLogo('우리은행') },
  '023': { name: 'SC제일은행', shortName: 'SC제일', color: '#0072AA', logo: getBankLogo('sc제일은행') },
  '027': { name: '한국씨티은행', shortName: '씨티', color: '#003B70', logo: getBankLogo('씨티은행') },
  '031': { name: '대구은행', shortName: '대구', color: '#00A0E2', logo: getBankLogo('대구은행') },
  '034': { name: '광주은행', shortName: '광주', color: '#0084D4', logo: getBankLogo('광주_전북은행') },
  '035': { name: '제주은행', shortName: '제주', color: '#003F7D', logo: getBankLogo('제주_신한은행') },
  '037': { name: '전북은행', shortName: '전북', color: '#0055A0', logo: getBankLogo('광주_전북은행') },
  '039': { name: '경남은행', shortName: '경남', color: '#D71922', logo: getBankLogo('경남은행') },
  '045': { name: '새마을금고', shortName: '새마을', color: '#0050A3', logo: getBankLogo('새마을은행') },
  '081': { name: 'KEB하나은행', shortName: '하나', color: '#00C7A9', logo: getBankLogo('하나은행') },
  '088': { name: '신한은행', shortName: '신한', color: '#0046FF', logo: getBankLogo('제주_신한은행') },
  '090': { name: '카카오뱅크', shortName: '카카오뱅크', color: '#FEE500', logo: getBankLogo('카카오뱅크') },
  '999': { name: '싸피은행', shortName: '싸피', color: '#004282 ', logo: getBankLogo('싸피은행') },
} as const;