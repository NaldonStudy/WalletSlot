import React, { useState } from 'react';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  View, 
  StyleSheet, 
  useColorScheme, 
  Text, 
  Alert
} from 'react-native';
import { Spacing, themes } from '@/src/constants/theme';
import { useNavigation } from '@react-navigation/native';
import ReceiptScanner from '@/src/components/camera/ReceiptScanner';

export default function ReceiptScanScreen() {
  console.log('[ReceiptScan] 컴포넌트 렌더링 시작');
  
  const { slotId, transactionId, transactionData, slotData, slotName, accountId, accountSlotId } = useLocalSearchParams<{ 
    slotId: string; 
    transactionId: string;
    transactionData?: string;
    slotData?: string;
    slotName?: string;
    accountId?: string;
    accountSlotId?: string;
  }>();
  
  console.log('[ReceiptScan] 파라미터:', { slotId, transactionId, accountId, accountSlotId });
  
  const colorScheme = useColorScheme() ?? 'light';
  const theme = themes[colorScheme];
  const navigation = useNavigation();

  // 탭바 숨기기
  useFocusEffect(
    React.useCallback(() => {
      navigation.getParent()?.setOptions({
        tabBarStyle: { display: 'none' }
      });

      return () => {
        navigation.getParent()?.setOptions({
          tabBarStyle: { display: 'flex' }
        });
      };
    }, [navigation])
  );

  // 이미지 처리 상태
  const [isProcessing, setIsProcessing] = useState(false);

  // 거래 데이터 파싱
  let transaction: any = null;
  if (transactionData) {
    try {
      transaction = JSON.parse(transactionData);
    } catch (error) {
      console.error('거래 데이터 파싱 오류:', error);
    }
  }

  // 이미지 캡처 핸들러
  const handleImageCaptured = async (imageUri: string) => {
    try {
      setIsProcessing(true);
      console.log('[ReceiptScan] 이미지 캡처됨:', imageUri);
      
      // 서버로 이미지 전송 및 OCR 처리
      await uploadReceiptForOCR(imageUri);
      
    } catch (error) {
      console.error('[ReceiptScan] 이미지 처리 오류:', error);
      Alert.alert('오류', '영수증 처리에 실패했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 영수증 서버 전송 및 OCR 처리
  const uploadReceiptForOCR = async (imageUri: string) => {
    try {
      console.log('서버 전송 시작:', imageUri);
      
      // FormData로 서버 전송
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'receipt.jpg',
      } as any);

      // TODO: 실제 API 엔드포인트로 교체
      const response = await fetch('https://api.example.com/ocr', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error('서버 응답 오류');
      }

      const result = await response.json();
      console.log('OCR 결과:', result);

      // OCR 결과 처리
      Alert.alert('성공', '영수증이 성공적으로 인식되었습니다!');
      
    } catch (error) {
      console.error('OCR 처리 오류:', error);
      Alert.alert('오류', '영수증 인식에 실패했습니다.');
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
      <View style={styles.container}>
        {/* 거래 정보 섹션 */}
        <View style={styles.transactionInfo}>
          <Text style={[styles.merchantName, { color: theme.colors.text.primary }]}>
            {transaction?.summary || transaction?.opponentName}
          </Text>
          <Text style={[styles.amount, { color: theme.colors.text.primary }]}>
            {(transaction?.type === '출금' || transaction?.type === '출금(이체)') ? '-' : ''}{transaction?.amount ? Number(transaction.amount).toLocaleString() : '0'}원
          </Text>
        </View>

        {/* 카메라 스캐너 컴포넌트 */}
        <ReceiptScanner
          onImageCaptured={handleImageCaptured}
          onBack={handleBack}
          theme={theme}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  transactionInfo: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  merchantName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});