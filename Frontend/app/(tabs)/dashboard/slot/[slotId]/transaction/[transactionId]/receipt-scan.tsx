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
import { ocrApi } from '@/src/api/ocr';
import { getDeviceId } from '@/src/services/deviceIdService';

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
    console.log('[ReceiptScan] handleImageCaptured 호출됨:', imageUri);
    
    try {
      setIsProcessing(true);
      console.log('[ReceiptScan] 이미지 캡처됨 - isProcessing: true');
      
      // 즉시 OCR 결과 화면으로 이동 (로딩 화면 표시)
      console.log('[ReceiptScan] OCR 결과 화면으로 즉시 이동');
      router.push({
        pathname: './ocr-result',
        params: {
          slotId: slotId || '',
          transactionId: transactionId || '',
          transactionData: transactionData || '',
          slotData: slotData || '',
          slotName: slotName || '',
          accountId: accountId || '',
          accountSlotId: accountSlotId || '',
          imageUri: imageUri, // 이미지 URI 전달
        }
      });
      
    } catch (error) {
      console.error('[ReceiptScan] 이미지 처리 오류:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      Alert.alert('오류', '영수증 처리에 실패했습니다.');
    } finally {
      console.log('[ReceiptScan] finally 블록 - isProcessing: false');
      setIsProcessing(false);
    }
  };

  // 영수증 서버 전송 및 OCR 처리
  const uploadReceiptForOCR = async (imageUri: string) => {
    console.log('[ReceiptScan] uploadReceiptForOCR 시작:', imageUri);
    
    try {
      console.log('[ReceiptScan] 서버 전송 시작:', imageUri);
      
      console.log('[ReceiptScan] 디바이스 ID 가져오기 시작');
      // 디바이스 ID 가져오기
      const deviceId = await getDeviceId();
      console.log('[ReceiptScan] 디바이스 ID 가져오기 완료:', deviceId);

      if (!deviceId) {
        console.error('[ReceiptScan] 디바이스 ID가 null입니다');
        throw new Error('디바이스 ID를 가져올 수 없습니다.');
      }

      console.log('[ReceiptScan] OCR API 호출 시작');
      // OCR API 호출
      const ocrResult = await ocrApi.processReceipt(imageUri, deviceId);
      console.log('[ReceiptScan] OCR API 호출 완료, 결과:', ocrResult);

      console.log('[ReceiptScan] OCR 결과 화면으로 이동 시작');
      // OCR 결과 화면으로 이동
      const ocrResultString = JSON.stringify(ocrResult);
      router.push({
        pathname: './ocr-result',
        params: {
          slotId: slotId || '',
          transactionId: transactionId || '',
          transactionData: transactionData || '',
          slotData: slotData || '',
          slotName: slotName || '',
          accountId: accountId || '',
          accountSlotId: accountSlotId || '',
          ocrResultData: ocrResultString,
        }
      });
      console.log('[ReceiptScan] OCR 결과 화면으로 이동 완료');
      
    } catch (error) {
      console.error('[ReceiptScan] OCR 처리 오류:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
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