import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { User, LocalUser } from '@/src/types';
import { STORAGE_KEYS } from '@/src/constants';
import { getOrCreateDeviceId } from '@/src/services/deviceIdService';
import { notificationApi } from '@/src/api/notification';
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
            // // 개발 중 하드코딩된 토큰 사용
            // if (__DEV__) {
            //     // 현재 디바이스 ID 확인
            //     const currentDeviceId = '1234';
            //     console.log('[🔑AUTH_SERVICE] 현재 디바이스 ID:', currentDeviceId);
                
            //     const hardcodedToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwidWlkIjoxLCJleHAiOjE3NTg3ODAyMDcsImlhdCI6MTc1ODY5MzgwNywiZGlkIjoiMTIzNCIsImp0aSI6ImI0NGNiZGIyLTMyZmYtNGVkZC1iOWM5LTY3NjUwMTczYmFiMiJ9.XJI_oAJaRgkjhBGPuB8rlI8OlQNBDhx_OKH76FQirR8';
            //     console.log('[🔑AUTH_SERVICE] 개발 모드: 하드코딩된 토큰 사용');
            //     return hardcodedToken;
            // }
            
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
    // 로그인 성공 시 모든 정보 저장 (response에서 자동으로 refreshToken 추출)
    async saveLoginData(response: Response): Promise<void> {
        try {
            const responseData = await response.json();
            const setCookieHeader = response.headers.get('Set-Cookie');
            const refreshToken = setCookieHeader ? extractRefreshTokenFromCookie(setCookieHeader) : null;
            
            if (!refreshToken) {
                throw new Error('RefreshToken을 Set-Cookie에서 추출할 수 없습니다');
            }
            
            const data = responseData.data; // ← data.data에서 실제 사용자 데이터 추출
            
            // 알림 동의 상태 확인
            const notificationConsent = await this.getNotificationConsent();
            
            const isPushEnabled = notificationConsent !== null 
                ? notificationConsent 
                : await (async () => {
                    try {
                        const response = await notificationApi.getUserNotificationSettings();
                        const value = response.data.isPushEnabled;
                        // 서버에서 가져온 값을 로컬에 저장
                        await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_CONSENT, value.toString());
                        return value;
                    } catch (error) {
                        console.error('[🔔AUTH_SERVICE] ❌서버 알림 설정 조회 실패:', error);
                        return true; // 에러 시 기본값
                    }
                })();
            
            const localUser: LocalUser = {
                userId: data.userId,
                userName: data.name,
                isPushEnabled: isPushEnabled,
            };
            
            await Promise.all([
                this.saveUser(localUser),
                this.saveAccessToken(data.accessToken),
                this.saveRefreshToken(refreshToken),
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

    // 알림 동의 상태 확인
    async getNotificationConsent(): Promise<boolean | null> {
        try {
            const consent = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_CONSENT);
            if (consent === 'true') return true;
            if (consent === 'false') return false;
            return null; // 'true'나 'false'가 아니면 null
        } catch (error) {
            console.error('[🔔AUTH_SERVICE] ❌알림 동의 상태 조회 실패:', error);
            return null;
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