import * as SecureStore from 'expo-secure-store';

const REFRESH_TOKEN_KEY = 'refresh_token';
const ACCESS_TOKEN_KEY = 'access_token';

/**
 * 리프레시 토큰을 SecureStore에 저장
 */
export const saveRefreshToken = async (refreshToken: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    console.log('✅ 리프레시 토큰 저장 완료');
  } catch (error) {
    console.error('❌ 리프레시 토큰 저장 실패:', error);
    throw error;
  }
};

/**
 * SecureStore에서 리프레시 토큰 조회
 */
export const getRefreshToken = async (): Promise<string | null> => {
  try {
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    return refreshToken;
  } catch (error) {
    console.error('❌ 리프레시 토큰 조회 실패:', error);
    return null;
  }
};

/**
 * SecureStore에서 리프레시 토큰 삭제
 */
export const deleteRefreshToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    console.log('✅ 리프레시 토큰 삭제 완료');
  } catch (error) {
    console.error('❌ 리프레시 토큰 삭제 실패:', error);
    throw error;
  }
};

/**
 * 액세스 토큰 저장 (SecureStore)
 */
export const saveAccessToken = async (accessToken: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    console.log('✅ 액세스 토큰 저장 완료');
  } catch (error) {
    console.error('❌ 액세스 토큰 저장 실패:', error);
    throw error;
  }
};

/**
 * 액세스 토큰 조회 (SecureStore)
 */
export const getAccessToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error('❌ 액세스 토큰 조회 실패:', error);
    return null;
  }
};

/**
 * 액세스 토큰 삭제 (SecureStore)
 */
export const deleteAccessToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    console.log('✅ 액세스 토큰 삭제 완료');
  } catch (error) {
    console.error('❌ 액세스 토큰 삭제 실패:', error);
    throw error;
  }
};

/**
 * JWT accessToken에서 exp(Unix seconds) 추출
 */
export const getJwtExp = (token: string): number | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payloadSeg = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = typeof atob === 'function'
      ? atob(payloadSeg)
      : Buffer.from(payloadSeg, 'base64').toString('binary');
    const payload = JSON.parse(decoded);
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
};

/**
 * 만료 임박 여부 판단 (기본 60초 이내)
 */
export const needsRefreshSoon = (token: string, thresholdSeconds = 60): boolean => {
  const exp = getJwtExp(token);
  if (!exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return exp - now <= thresholdSeconds;
};
