import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  SafeAreaView,
  Dimensions
} from 'react-native';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function NotificationConsentScreen() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 알림 허용 처리
  const handleAllow = async () => {
    setIsLoading(true);
    
    try {
      // TODO: 서버에 회원가입 데이터 전송
      // - PIN (임시 저장된 것)
      // - 알림 동의: true
      // - 기타 회원가입 정보
      
      console.log('알림 허용 - 서버 전송');
      
      // 성공 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // welcome 화면으로 이동
      router.push('/(auth)/(signup)/welcome');
    } catch (error) {
      Alert.alert('오류', '알림 설정 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 알림 거부 처리
  const handleDeny = async () => {
    setIsLoading(true);
    
    try {
      // TODO: 서버에 회원가입 데이터 전송
      // - PIN (임시 저장된 것)
      // - 알림 동의: false
      // - 기타 회원가입 정보
      
      console.log('알림 거부 - 서버 전송');
      
      // 성공 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // welcome 화면으로 이동
      router.push('/(auth)/(signup)/welcome');
    } catch (error) {
      Alert.alert('오류', '알림 설정 중 오류가 발생했습니다.');
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
