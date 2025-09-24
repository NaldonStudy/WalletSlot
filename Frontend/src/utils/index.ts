/**
 * 유틸리티 함수 모음
 * 각 도메인별로 분리된 유틸리티들을 통합 export
 */

// 유효성 검사 관련
export { validation } from './validation';

// 포맷팅 관련 (금액, 날짜, 시간, 퍼센트 등)
export { format } from './format';

// 색상 관련
export { color } from './color';

// 디바이스 관련
export { device } from './device';

// 딥링크 관련
export { deepLink } from './deepLink';

/**
 * 주민등록번호에서 성별과 생년월일 추출
 */
export const extractGenderAndBirthDate = (residentFront6: string, residentBack1: string) => {
  // 주민등록번호 앞 6자리에서 생년월일 추출
  const year = parseInt(residentFront6.substring(0, 2));
  const month = residentFront6.substring(2, 4);
  const day = residentFront6.substring(4, 6);
  
  // 성별 코드 (뒤 1자리)
  const genderCode = parseInt(residentBack1);
  
  // 2000년대 출생 여부 판단 (성별 코드 3,4는 2000년대)
  const is2000s = genderCode === 3 || genderCode === 4;
  const fullYear = is2000s ? 2000 + year : 1900 + year;
  
  // 성별 판단 (1,3: 남성, 2,4: 여성)
  const gender = (genderCode === 1 || genderCode === 3) ? 'MAN' : 'WOMAN';
  
  // 생년월일 YYYY-MM-DD 형식으로 변환
  const birthDate = `${fullYear}-${month}-${day}`;
  
  return {
    gender: gender as 'MAN' | 'WOMAN',
    birthDate
  };
};
