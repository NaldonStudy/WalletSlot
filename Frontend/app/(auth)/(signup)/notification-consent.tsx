import { authApi } from '@/src/api/auth';
import { featureFlags } from '@/src/config/featureFlags';
import { appService } from '@/src/services/appService';
import { getOrCreateDeviceId } from '@/src/services/deviceIdService';
import { saveAccessToken, saveRefreshToken } from '@/src/services/tokenService';
import { unifiedPushService } from '@/src/services/unifiedPushService';
import { useLocalUserStore } from '@/src/store/localUserStore';
import { useSignupStore } from '@/src/store/signupStore';
import { extractGenderAndBirthDate } from '@/src/utils';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

export default function NotificationConsentScreen() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const params = useLocalSearchParams();
  const fromLogin = params.from === 'login' || params.mode === 'login';
  
  // 스토어에서 회원가입 정보와 알림 동의 저장 함수 가져오기
  const { 
    name, 
    residentFront6, 
    residentBack1, 
    phone, 
    carrier, 
    signupTicket, 
    pin, 
    setPushEnabled,
    clearSignupTicket,
    clearPin,
    reset: resetSignupStore // signupStore 초기화용
  } = useSignupStore();
  
  // 로컬 사용자 스토어
  const { setUser } = useLocalUserStore();

  // 최종 회원가입 API 호출 함수
  const completeSignup = async (pushEnabled: boolean, fcmToken?: string) => {
    try {
      // 필수 정보 검증
      if (!name || !residentFront6 || !residentBack1 || !phone || !signupTicket || !pin) {
        throw new Error('회원가입 정보가 불완전합니다.');
      }

      // 주민등록번호에서 성별과 생년월일 추출
  const { gender, birthDate } = extractGenderAndBirthDate(residentFront6, residentBack1);
  const backendGender = gender === 'WOMAN' ? 'FEMALE' : 'MAN';
      
      // 디바이스 ID 가져오기
      const deviceId = await getOrCreateDeviceId();
      
  // 플랫폼 정보 (타입을 명시하여 CompleteSignupRequest의 유니온에 맞춥니다)
  const platform: 'ANDROID' | 'IOS' = Platform.OS === 'ios' ? 'IOS' : 'ANDROID';
      
      // 입력 정규화 및 안전값 구성
      const normalizedName = String(name || '').trim();
      const normalizedPhone = String(phone || '').replace(/\D/g, '');
      const baseDay = 10; // 정책 상수화(1~28 범위)
      const safeBaseDay = Math.min(Math.max(baseDay, 1), 28);
      const job: 'STUDENT' | 'OFFICE_WORKER' | 'FREELANCER' | 'BUSINESS_OWNER' | 'HOUSEWIFE' | 'UNEMPLOYED' | 'OTHER' | null = 'OTHER';

      // 회원가입 요청 데이터 구성 (pushToken은 존재할 때만 포함)
      const signupData: any = {
        name: normalizedName,
        phone: normalizedPhone,
  gender: backendGender,
        birthDate,
        signupTicket,
        pin,
        baseDay: safeBaseDay,
        job,
        deviceId,
        platform,
        pushEnabled,
      };
      if (fcmToken) signupData.pushToken = fcmToken;

      console.log('회원가입 요청 데이터:', {
        ...signupData,
        pin: '****', // 보안을 위해 PIN은 마스킹
        pushToken: fcmToken ? `${fcmToken.substring(0, 20)}...` : 'null'
      });
      
      // signupTicket 상세 로깅
      console.log('🔍 signupTicket 상세 정보:', {
        signupTicket,
        length: signupTicket?.length,
        type: typeof signupTicket,
        isUsed: signupTicket === 'used' || signupTicket === 'expired'
      });

  // 회원가입 API 호출
  const response = await authApi.completeSignup(signupData);
      
  if (response.success) {
        // signupTicket 사용 후 즉시 무효화 (중복 사용 방지)
        clearSignupTicket();
        console.log('✅ signupTicket 사용 완료 및 무효화');
        console.log('✅ 회원가입 성공:', {
          userId: response.data.userId,
          hasAccessToken: !!response.data.accessToken,
          hasRefreshToken: !!response.data.refreshToken
        });
        
        // 1. 토큰을 SecureStore에 저장 (AT/RT)
        await saveAccessToken(response.data.accessToken);
        await saveRefreshToken(response.data.refreshToken);
        
        // 2. 로컬 사용자 정보를 AsyncStorage에 저장 (AT는 저장하지 않음)
        await setUser({
          userName: name!,
          isPushEnabled: pushEnabled,
          deviceId,
        });
        
        // 3. signupStore 초기화 (회원가입 완료 후 더 이상 필요 없음)
        resetSignupStore();
        console.log('✅ signupStore 초기화 완료');
        
        // 4. 온보딩 완료 처리
        try {
          await appService.setOnboardingCompleted(true);
          featureFlags.setOnboardingEnabled(true);
          console.log('✅ 온보딩 완료 처리됨');
        } catch (error) {
          console.error('⚠️ 온보딩 완료 처리 실패:', error);
        }
        
        // 5. welcome 화면으로 이동
        router.push('/(auth)/(signup)/welcome');
      } else {
        const msg = response.message || '회원가입에 실패했습니다.';
        throw new Error(msg);
      }
    } catch (error: any) {
      console.error('회원가입 API 호출 실패:', error);
      // 에러 코드/메시지에 따른 사용자 안내 매핑
      const code: string | undefined = error?.code || error?.details?.errorCode || error?.details?.code;
      let title = '회원가입 실패';
      let message = error?.message || '회원가입 중 오류가 발생했습니다.';

      // 403/권한/티켓 관련 패턴 처리
      if (code === 'HTTP_403' || code === 'FORBIDDEN' || code === 'SIGNUP_TICKET_FORBIDDEN' || /403/.test(String(code))) {
        title = '가입이 불가합니다';
        if (/expired|만료/i.test(message)) {
          message = '인증 시간이 지났습니다. SMS 인증부터 다시 진행해주세요.';
        } else if (/used|이미 사용|already/i.test(message)) {
          message = '이미 사용된 인증입니다. SMS 인증을 다시 받아서 진행해주세요.';
        } else if (/policy|정책|조건/i.test(message)) {
          message = '가입 조건을 충족하지 않아 진행할 수 없습니다.';
        } else {
          message = '보안 정책으로 인해 가입을 진행할 수 없습니다. SMS 인증부터 다시 진행해주세요.';
        }
        // 티켓/핀 정리 후 휴대폰 인증 화면으로 이동
        try {
          clearSignupTicket();
          clearPin();
        } catch {}
        Alert.alert(title, message, [
          {
            text: '확인',
            onPress: () => {
              try {
                router.replace('/(auth)/(signup)/phone' as any);
              } catch {}
            },
          },
        ]);
        return; // 처리 완료: 재throw로 인한 중복 Alert 방지
      }

      // 409/중복 요청 처리
      if (code === 'HTTP_409' || /409/.test(String(code))) {
        title = '중복된 요청';
        if (/signupTicket|티켓|이미 사용/i.test(message)) {
          message = '이미 사용된 인증입니다. SMS 인증부터 다시 진행해주세요.';
          // 티켓/핀 정리 후 휴대폰 인증 화면으로 이동
          try {
            clearSignupTicket();
            clearPin();
          } catch {}
          Alert.alert(title, message, [
            {
              text: '확인',
              onPress: () => {
                try {
                  router.replace('/(auth)/(signup)/phone' as any);
                } catch {}
              },
            },
          ]);
          return;
        } else if (/phone|전화번호|이미 가입/i.test(message)) {
          message = '이미 가입된 전화번호입니다. 로그인을 시도해주세요.';
          Alert.alert(title, message, [
            {
              text: '로그인하기',
              onPress: () => {
                try {
                  router.replace('/(auth)/(login)/login' as any);
                } catch {}
              },
            },
            {
              text: '취소',
              style: 'cancel',
            },
          ]);
          return;
        } else {
          message = '중복된 요청입니다. 잠시 후 다시 시도해주세요.';
        }
        Alert.alert(title, message);
        return;
      }

      // 500/서버 내부 오류는 요청 ID와 함께 안내
      if (code === 'HTTP_500' || /500/.test(String(code))) {
      const reqId = error?.details?.requestId;
      const userMsg = reqId
        ? `${message}\n\n요청 ID: ${reqId}\n다시 시도하거나, 지속 시 관리자에게 문의해주세요.`
        : `${message}\n\n다시 시도하거나, 지속 시 관리자에게 문의해주세요.`;
      Alert.alert('서버 오류', userMsg);
      return;
      }

      Alert.alert(title, message);
      throw error;
    }
  };

  // 알림 허용 처리
  const handleAllow = async () => {
    if (isLoading) return; // 이중 제출 방지
    setIsLoading(true);
    
    try {
      // 로그인 경로: 동의 저장 + 푸시 초기화 후 메인으로
      if (fromLogin) {
        setPushEnabled(true);
        console.log('알림 허용(로그인 모드) - 스토어에 저장');
        try {
          console.log('FCM 토큰 발급 시작...(로그인 모드)');
          await unifiedPushService.initialize();
        } catch {}
  router.replace('/(tabs)/dashboard' as any);
        return;
      }

      // 회원가입 경로: 기존 completeSignup 플로우
      setPushEnabled(true);
      console.log('알림 허용 - 스토어에 저장');

      console.log('FCM 토큰 발급 시작...');
      const pushResult = await unifiedPushService.initialize();
      let fcmToken: string | undefined;
      if (pushResult.success) {
        console.log('✅ FCM 토큰 발급 및 서버 등록 성공');
        console.log('Device ID:', pushResult.deviceId);
        fcmToken = unifiedPushService.getFCMToken() || undefined;
      } else {
        console.warn('⚠️ FCM 토큰 발급 실패 (알림 기능 제한)');
      }
      await completeSignup(true, fcmToken);
      
    } catch (error: any) {
      console.error('알림 허용 처리 중 오류:', error);
      const code: string | undefined = error?.code || error?.details?.errorCode || error?.details?.code;
      if (code !== 'HTTP_403' && code !== 'FORBIDDEN') {
        Alert.alert('오류', '알림 설정 중 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 알림 거부 처리
  const handleDeny = async () => {
    if (isLoading) return; // 이중 제출 방지
    setIsLoading(true);
    
    try {
      if (fromLogin) {
        setPushEnabled(false);
        console.log('알림 거부(로그인 모드) - 스토어에 저장');
  router.replace('/(tabs)/dashboard' as any);
        return;
      }

      setPushEnabled(false);
      console.log('알림 거부 - 스토어에 저장');
      console.log('알림 거부 - FCM 토큰 발급하지 않음');
      await completeSignup(false, undefined);
      
    } catch (error: any) {
      console.error('알림 거부 처리 중 오류:', error);
      const code: string | undefined = error?.code || error?.details?.errorCode || error?.details?.code;
      if (code !== 'HTTP_403' && code !== 'FORBIDDEN') {
        Alert.alert('오류', '알림 설정 중 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* 상단 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>PUSH 알림 동의</Text>
        </View>

        {/* 메인 콘텐츠 카드 */}
        <View style={styles.card}>
          {/* 카드 내부 헤더 */}
          <Text style={styles.cardTitle}>서비스 PUSH 알림 동의</Text>
          
          {/* 메가폰 일러스트레이션 */}
          <View style={styles.illustrationContainer}>
            <View style={styles.megaphone}>
              <View style={styles.megaphoneCone} />
              <View style={styles.megaphoneHandle} />
            </View>
          </View>
          
          {/* 메인 메시지 */}
          <Text style={styles.mainMessage}>중요한 소식만 알려드릴게요</Text>
          
          {/* 설명 텍스트 */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText}>
              계정 보안과 예산 변동을 빠르게 알려드려요.
            </Text>
            <Text style={styles.descriptionText}>
              광고/프로모션 알림은 포함되지 않습니다.
            </Text>
          </View>
          
          {/* 설정 안내 텍스트 */}
          <Text style={styles.settingsText}>
            알림은 [알림 설정]에서 언제든 변경할 수 있어요.
          </Text>
          
          {/* 버튼들 */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.denyButton}
              onPress={handleDeny}
              disabled={isLoading}
            >
              <Text style={styles.denyButtonText}>허용 안 함</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.allowButton}
              onPress={handleAllow}
              disabled={isLoading}
            >
              <Text style={styles.allowButtonText}>
                {isLoading ? '처리 중...' : '허용'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 32,
  },
  illustrationContainer: {
    marginBottom: 32,
    position: 'relative',
  },
  megaphone: {
    width: 120,
    height: 120,
    position: 'relative',
  },
  megaphoneCone: {
    width: 80,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    position: 'absolute',
    top: 20,
    left: 20,
    borderWidth: 3,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  megaphoneHandle: {
    width: 40,
    height: 60,
    backgroundColor: '#1E40AF',
    borderRadius: 20,
    position: 'absolute',
    top: 40,
    right: 0,
  },
  mainMessage: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 24,
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  descriptionText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  settingsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  denyButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  denyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  allowButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  allowButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
