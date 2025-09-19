import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { LocalUser, AuthTokens } from '@/src/types';
import { getOrCreateDeviceId } from '@/src/services/deviceIdService';
import { Buffer } from 'buffer';

// ===== 인증 관련 헬퍼 함수들 =====
// Set-Cookie 헤더에서 refreshToken 추출
function extractRefreshTokenFromCookie(setCookieHeader: string): string | null {
    try {
        const refreshTokenMatch = setCookieHeader.match(/refreshToken=([^;]+)/);
        return refreshTokenMatch ? refreshTokenMatch[1] : null;
    } catch (error) {
        console.error('[AUTH_SERVICE] Set-Cookie 파싱 실패:', error);
        return null;
    }
}

// JWT 토큰 만료 확인
function isTokenExpired(token: string): boolean {
    try {
        const [, payloadBase64] = token.split('.');
        if (!payloadBase64) return true;
    

        // atob이 없을 수 있어 Buffer로 폴백
        const json = 
        typeof atob === 'function' ? atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')) 
        : Buffer.from(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');

        const payload = JSON.parse(json);
        const exp = Number(payload?.exp);
        if (!exp) return true;

        // 약간의 여유(예: 30초) 두고 만료 처리
        const now = Math.floor(Date.now() / 1000);
        const skewSeconds = 30;
        return exp <= now + skewSeconds;
      } catch {
        return true; // 파싱 실패는 만료로 간주
    }
}


// ====== 저장소 키 상수 ======
const STORAGE_KEYS = {
    USER : 'local_user',
    ACCESS_TOKEN : 'access_token',
    REFRESH_TOKEN : 'refresh_token',
} as const;


export const authService = {

// ============= 사용자 정보 관리 ============= 
    // 사용자 정보 저장(JSON 통합합)
    async saveUser(user: LocalUser): Promise<void> {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
            console.log('[📝AUTH_SERVICE] ✅사용자 정보 저장 완료:', user.userId);
        } catch (error) {
            console.error('[📝AUTH_SERVICE] ❌사용자 정보 저장 실패:', error);
            throw error;
        }
    },

    // 사용자 정보 조회(JSON에서 파싱)
    async getUser(): Promise<LocalUser | null> {
        try {
            const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);
            if (!userData) return null;
            return JSON.parse(userData) as LocalUser;
        } catch (error) {
            console.error('[📝AUTH_SERVICE] ❌사용자 정보 조회 실패:', error);
            return null;
        }
    },

    // 사용자 정보 삭제
    async clearUser(): Promise<void> {
        try {
            await AsyncStorage.removeItem(STORAGE_KEYS.USER);
            console.log('[📝AUTH_SERVICE] ✅사용자 정보 삭제 완료');
        } catch (error) {
            console.error('[📝AUTH_SERVICE] ❌사용자 정보 삭제 실패:', error);
            throw error;
        }
    },

// ============= 토큰 관리 =============
    // AccessToken 저장(AsyncStorage)
    async saveAccessToken(token: string): Promise<void> {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
            console.log('[🔑AUTH_SERVICE] ✅AccessToken 저장 완료');
        } catch (error) {
            console.error('[🔑AUTH_SERVICE] ❌AccessToken 저장 실패:', error);
            throw error;
        }
    },

    // AccessToken 조회(AsyncStorage)
    async getAccessToken(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        } catch (error) {
            console.error('[🔑AUTH_SERVICE] ❌AccessToken 조회 실패:', error);
            return null;
        }
    },

    // RefreshToken 저장(SecureStore)
    async saveRefreshToken(token: string): Promise<void> {
        try {
            await SecureStore.setItemAsync((STORAGE_KEYS.REFRESH_TOKEN), token);
            console.log('[🔒AUTH_SERVICE] ✅RefreshToken 저장 완료');
        } catch (error) {
            console.error('[🔒AUTH_SERVICE] ❌RefreshToken 저장 실패:', error);
            throw error;
        }
    },

    // RefreshToken 조회(SecureStore)
    async getRefreshToken(): Promise<string | null> {
        try {
            return await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
        } catch (error) {
            console.error('[🔒AUTH_SERVICE] ❌RefreshToken 조회 실패:', error);
            return null;
        }
    },

// ============= 토큰 재발급 관리 =============
    // 토큰 재발급 (백엔드 API 호출)
    async refreshAccessToken(): Promise<string | null> {
        try {
            // RefreshToken 조회
            const refreshToken = await this.getRefreshToken();
            if (!refreshToken) {
                console.error('[🔒AUTH_SERVICE] ❌RefreshToken 없어서 재발급 불가');
                return null;
            }

            // fetch를 사용한 재발급 요청 (Set-Cookie 처리를 위해)
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Device-Id': await getOrCreateDeviceId(),
                    'Cookie': `refreshToken=${refreshToken}`, //cookie로 refreshToken 자동 첨부
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('[🔑AUTH_SERVICE] ❌토큰 재발급 실패:', response.status, errorData.message);
                await this.clearAll();
                return null;
            }
            
            // 정상 응답 시 aceesToken과 refreshToken 추출
            const newData = await response.json();

            // 새로운 AccessToken 발급 & 저장
            const newAccessToken = newData.data.accessToken;
            await this.saveAccessToken(newAccessToken);
            
            // Set-Cookie에서 새로운 refreshToken 추출하여 저장
            const setCookieHeader = response.headers.get('Set-Cookie');
            if (setCookieHeader) {
                const newRefreshToken = extractRefreshTokenFromCookie(setCookieHeader);
                if (newRefreshToken) {
                    await this.saveRefreshToken(newRefreshToken);
                    console.log('[🔄AUTH_SERVICE] ✅RefreshToken 회전 완료');
                }
            }
            
            console.log('[🔄AUTH_SERVICE] ✅AccessToken 재발급 완료');
            return newAccessToken;
        } catch (error) {
            console.error('[🔄AUTH_SERVICE] ❌토큰 재발급 실패:', error);
            await this.clearAll();
            return null;
        }
    },


// ============= 통합 관리 =============
    // 로그인 성공 시 모든 정보 저장
    async saveLoginData(user: LocalUser, tokens: AuthTokens): Promise<void> {
        try {
            await Promise.all([
                this.saveUser(user),
                this.saveAccessToken(tokens.accessToken),
                this.saveRefreshToken(tokens.refreshToken),
            ]);
            console.log('[🎯AUTH_SERVICE] ✅로그인 데이터 저장 완료');
        } catch (error) {
            console.error('[🎯AUTH_SERVICE] ❌로그인 데이터 저장 실패:', error);
            throw error;
        }
    },

    // 로그아웃 시 모든 정보 삭제
    async clearAll(): Promise<void> {
        try {
            await Promise.all([
                this.clearUser(),
                AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
                SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
            ]);
            console.log('[😢AUTH_SERVICE] ✅로그아웃 데이터 삭제 완료');
        } catch (error) {
            console.error('[😢AUTH_SERVICE] ❌로그아웃 데이터 삭제 실패:', error);
            throw error;
        }
    },

    // 로그인 상태 확인
    async isLoggedIn(): Promise<boolean> {
        try {
            const [user, accessToken] = await Promise.all([
                this.getUser(),
                this.getAccessToken(),
            ]);
            return !!(user && accessToken);
        } catch (error) {
            console.error('[👀AUTH_SERVICE] ❌로그인 상태 확인 실패:', error);
            return false;
        }
    }
    
}