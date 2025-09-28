// 인증 서비스
import { API_CONFIG, STORAGE_KEYS } from '@/src/constants';
import { API_ENDPOINTS } from '@/src/constants/api';
import { getOrCreateDeviceId } from '@/src/services/deviceIdService';
import { deleteAccessToken as ssDelAT, getAccessToken as ssGetAT, saveAccessToken as ssSaveAT, saveRefreshToken as ssSaveRT } from '@/src/services/tokenService';
import { LocalUser } from '@/src/types';
import type { LoginResponse } from '@/src/types/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// ===== 인증 관련 헬퍼 함수들 =====
// (이 파일에서 Set-Cookie 기반 토큰 추출은 더 이상 사용하지 않음)

// AsyncStorage에 대해 간단한 retry 래퍼 (일시적 unavailability 완화 목적)
async function storageSetItemWithRetry(key: string, value: string, retries = 3, delayMs = 100): Promise<void> {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await AsyncStorage.setItem(key, value);
            return;
        } catch (err) {
            if (attempt === retries) throw err;
            await new Promise((r) => setTimeout(r, delayMs));
        }
    }
}

async function storageRemoveItemWithRetry(key: string, retries = 3, delayMs = 100): Promise<void> {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await AsyncStorage.removeItem(key);
            return;
        } catch (err) {
            if (attempt === retries) throw err;
            await new Promise((r) => setTimeout(r, delayMs));
        }
    }
}


export const authService = {

// ============= 사용자 정보 관리 ============= 
    // 사용자 정보 저장(JSON 통합합)
    async saveUser(user: LocalUser): Promise<void> {
        try {
            await storageSetItemWithRetry(STORAGE_KEYS.USER, JSON.stringify(user));
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
            await storageRemoveItemWithRetry(STORAGE_KEYS.USER);
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
            const refreshUrl = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH_REFRESH}`;
            const response = await fetch(refreshUrl, {
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
                    await this.clearAll();
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
            // 기본 동작: 실패 시 모든 인증 상태를 제거
            await this.clearAll();
            return null;
        }
    },


// ============= 통합 관리 =============
    // 로그인 성공 시 모든 정보 저장
    // 이 함수는 이미 파싱된 API 응답(예: authApi.login()이 반환한 객체)을 기대합니다.
    async saveLoginData(loginResp: LoginResponse): Promise<void> {
        try {
            const data = loginResp?.data ?? {};

            // 알림 동의 상태 확인 (기존 동작 유지)
            const notificationConsent = await this.getNotificationConsent();
            const isPushEnabled = notificationConsent !== null
                ? notificationConsent
                : await (async () => {
                    try {
                        const { notificationApi } = await import('@/src/api/notification');
                        const response = await notificationApi.getUserNotificationSettings();
                        const value = response.data.isPushEnabled;
                        await storageSetItemWithRetry(STORAGE_KEYS.NOTIFICATION_CONSENT, value.toString());
                        return value;
                    } catch (error) {
                        console.error('[🔔AUTH_SERVICE] ❌서버 알림 설정 조회 실패:', error);
                        return true; // 에러 시 기본값
                    }
                })();

            // 서버가 user 필드를 제공하면 저장, 아니면 토큰만 저장하고 사용자 정보는 따로 가져오는 흐름을 따릅니다.
            let localUser: LocalUser | null = null;
            if (data.user || data.userId) {
                localUser = {
                    userId: data.userId ?? data.user?.userId ?? 0,
                    userName: data.user?.name ?? '사용자',
                    isPushEnabled: isPushEnabled,
                };
            }

            const tasks: Promise<void>[] = [];
            if (localUser) tasks.push(this.saveUser(localUser));
            if (data.accessToken) tasks.push(this.saveAccessToken(data.accessToken));
            if (data.refreshToken) tasks.push(this.saveRefreshToken(data.refreshToken));

            await Promise.all(tasks);
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