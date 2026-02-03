import { getAccessToken, getJwtExp } from '@/src/services/tokenService';
import { useLocalUserStore } from '@/src/store/localUserStore';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  // 로컬 사용자 정보 가져오기
  const { user, isLoggedIn } = useLocalUserStore();

  useEffect(() => {
    // 회원가입 완료 후 로그인 상태 확인
    console.log('환영 화면 - 사용자 정보:', {
      userName: user?.userName,
      isLoggedIn
    });

    // DEBUG: accessToken exp 실측 로그
    (async () => {
      try {
        const at = await getAccessToken();
        const exp = at ? getJwtExp(at) : null;
        const now = Math.floor(Date.now() / 1000);
        const remain = exp ? exp - now : null;
        console.log('[DEBUG] accessToken exp:', exp, 'remainSec:', remain);
      } catch (e) {
        console.warn('[DEBUG] accessToken exp 확인 실패:', e);
      }
    })();
  }, [user, isLoggedIn]);

  const handleGetStarted = () => {
    // 은행 선택 화면으로 이동
    router.replace('/(mydata)/bank-select' as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* 메인 콘텐츠 */}
        <View style={styles.content}>
          {/* 환영 메시지 */}
          <Text style={styles.title}>환영합니다!</Text>
          <Text style={styles.subtitle}>
            Wallet Slot 회원가입이 완료되었습니다.
          </Text>
          
          {/* 체크 아이콘 */}
          <View style={styles.iconContainer}>
            <View style={styles.checkIcon}>
              <Text style={styles.checkText}>✓</Text>
            </View>
          </View>
          
          {/* 설명 텍스트 */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText}>
              이제 Wallet Slot의 모든 기능을 사용하실 수 있습니다.
            </Text>
            <Text style={styles.descriptionText}>
              안전하고 편리한 금융 관리 서비스를 경험해보세요.
            </Text>
          </View>
        </View>

        {/* 시작하기 버튼 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleGetStarted}
          >
            <Text style={styles.getStartedButtonText}>시작하기</Text>
          </TouchableOpacity>
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
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    marginBottom: 48,
  },
  checkIcon: {
    width: 80,
    height: 80,
    backgroundColor: '#10B981',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  checkText: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  descriptionContainer: {
    alignItems: 'center',
  },
  descriptionText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  buttonContainer: {
    paddingVertical: 32,
  },
  getStartedButton: {
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
  getStartedButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
