import { DEV_AUTH_BYPASS } from '@/src/config/devAuthBypass';
import { API_CONFIG, STORAGE_KEYS } from '@/src/constants';
import { getOrCreateDeviceId } from '@/src/services/deviceIdService';
import { deleteAccessToken as ssDelAT, getAccessToken as ssGetAT, saveAccessToken as ssSaveAT, saveRefreshToken as ssSaveRT } from '@/src/services/tokenService';
import { LocalUser } from '@/src/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

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
    // AccessToken 저장(SecureStore)
    async saveAccessToken(token: string): Promise<void> {
        try {
            await ssSaveAT(token);
            console.log('[🔑AUTH_SERVICE] ✅AccessToken 저장 완료 (SecureStore)');
        } catch (error) {
            console.error('[🔑AUTH_SERVICE] ❌AccessToken 저장 실패:', error);
            throw error;
        }
    },

    // AccessToken 조회(SecureStore)
    async getAccessToken(): Promise<string | null> {
        try {
            // SecureStore에 저장된 액세스 토큰 사용
            return await ssGetAT();
        } catch (error) {
            console.error('[🔑AUTH_SERVICE] ❌AccessToken 조회 실패:', error);
            return null;
        }
    },

    // RefreshToken 저장(SecureStore)
    async saveRefreshToken(token: string): Promise<void> {
        try {
            await ssSaveRT(token);
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

            // 명세에 따라 body로 refreshToken + deviceId 전송
            const requestId = `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Device-Id': await getOrCreateDeviceId(),
                    'X-Request-Id': requestId,
                },
                body: JSON.stringify({ refreshToken, deviceId: await getOrCreateDeviceId() }),
            });

            if (!response.ok) {
                // 상태별 분기 처리
                if (response.status === 401 || response.status === 403) {
                    console.error('[🔑AUTH_SERVICE] ❌토큰 재발급 실패(권한):', response.status);
                    // 개발 바이패스 중에는 토큰 삭제/로그아웃을 하지 않음
                    if (!DEV_AUTH_BYPASS.enabled) {
                        await this.clearAll();
                    }
                    return null;
                }
                // 네트워크/서버 오류는 상위에서 재시도할 수 있도록 throw
                const txt = await response.text();
                throw new Error(`[REFRESH_FAIL_${response.status}] ${txt || 'refresh failed'}`);
            }

            // 정상 응답: body로 accessToken/refreshToken 제공
            const newData = await response.json();
            const newAccessToken = newData.data?.accessToken;
            const newRefreshToken = newData.data?.refreshToken;
            if (newAccessToken) await this.saveAccessToken(newAccessToken);
            if (newRefreshToken) await this.saveRefreshToken(newRefreshToken);
            
            console.log('[🔄AUTH_SERVICE] ✅AccessToken 재발급 완료');
            return newAccessToken;
        } catch (error) {
            console.error('[🔄AUTH_SERVICE] ❌토큰 재발급 실패:', error);
            // 개발 바이패스 중에는 토큰 삭제/로그아웃을 하지 않음
            if (DEV_AUTH_BYPASS.enabled) {
                return null;
            }
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
                        const { notificationApi } = await import('@/src/api/notification');
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
                ssDelAT(),
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