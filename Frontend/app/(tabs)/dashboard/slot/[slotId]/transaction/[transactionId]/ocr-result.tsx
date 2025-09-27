import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  View, 
  StyleSheet, 
  useColorScheme, 
  Text, 
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Spacing, themes } from '@/src/constants/theme';
import { OCRReceiptResponse, ocrApi } from '@/src/api/ocr';
import { getDeviceId } from '@/src/services/deviceIdService';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  interpolate
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import { Asset } from 'expo-asset';

const { width, height } = Dimensions.get('window');

export default function OCRResultScreen() {
  const { 
    slotId, 
    transactionId, 
    transactionData, 
    slotData, 
    slotName, 
    accountId, 
    accountSlotId,
    ocrResultData,
    imageUri 
  } = useLocalSearchParams<{ 
    slotId: string; 
    transactionId: string;
    transactionData?: string;
    slotData?: string;
    slotName?: string;
    accountId?: string;
    accountSlotId?: string;
    ocrResultData?: string;
    imageUri?: string;
  }>();
  
  const colorScheme = useColorScheme() ?? 'light';
  const theme = themes[colorScheme];
  const navigation = useNavigation();

  // 로딩 상태 및 OCR 결과 상태
  const [isLoading, setIsLoading] = useState(true);
  const [ocrResult, setOcrResult] = useState<OCRReceiptResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // 애니메이션 값
  const scannerPosition = useSharedValue(0);

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

  // 이미지 미리 로드
  useEffect(() => {
    const preloadImage = async () => {
      try {
        const asset = Asset.fromModule(require('@/src/assets/images/dashboard/ocr.png'));
        await asset.downloadAsync();
        setImageLoaded(true);
        console.log('[OCRResult] 이미지 미리 로드 완료');
      } catch (error) {
        console.error('[OCRResult] 이미지 미리 로드 실패:', error);
        setImageLoaded(true); // 실패해도 계속 진행
      }
    };

    preloadImage();
  }, []);

  // 스캐너 애니메이션 시작
  useEffect(() => {
    if (isLoading && imageLoaded) {
      scannerPosition.value = withRepeat(
        withTiming(1, { duration: 2000 }),
        -1, // 무한 반복
        true // reverse: true로 설정하여 위아래로 왕복
      );
    }
  }, [isLoading, imageLoaded]);

  // OCR API 호출
  useEffect(() => {
    const processOCR = async () => {
      try {
        console.log('[OCRResult] OCR 처리 시작');
        
        if (imageUri) {
          // 이미지 URI가 있으면 OCR API 호출
          console.log('[OCRResult] 이미지 URI로 OCR API 호출:', imageUri);
          
          const deviceId = await getDeviceId();
          console.log('[OCRResult] 디바이스 ID:', deviceId);

          if (!deviceId) {
            throw new Error('디바이스 ID를 가져올 수 없습니다.');
          }

          const result = await ocrApi.processReceipt(imageUri, deviceId);
          console.log('[OCRResult] OCR API 호출 완료:', result);
          
          setOcrResult(result);
        } else if (ocrResultData) {
          // OCR 결과 데이터가 있으면 파싱
          console.log('[OCRResult] OCR 결과 데이터 파싱');
          const parsedResult = JSON.parse(ocrResultData);
          setOcrResult(parsedResult);
        } else {
          throw new Error('OCR 처리할 데이터가 없습니다.');
        }
        
        // 로딩 완료
        setTimeout(() => {
          setIsLoading(false);
        }, 1000); // 1초 후 로딩 완료
        
      } catch (error) {
        console.error('[OCRResult] OCR 처리 오류:', error);
        setError(error instanceof Error ? error.message : 'OCR 처리에 실패했습니다.');
        setIsLoading(false);
      }
    };

    processOCR();
  }, [imageUri, ocrResultData]);

  const handleBack = () => {
    router.back();
  };

  const handleConfirm = () => {
    // TODO: OCR 결과를 확인하고 다음 단계로 진행
    console.log('[OCRResult] OCR 결과 확인 완료');
    router.back();
  };

  // 스캐너 애니메이션 스타일
  const scannerAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scannerPosition.value,
      [0, 1],
      [0, 400] // 스캔 영역 높이만큼 이동
    );

    const opacity = interpolate(
      scannerPosition.value,
      [0, 0.05, 0.95, 1],
      [0, 1, 1, 0] // 시작과 끝에서 투명
    );

    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  // 에러 상태 처리
  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
        <View style={styles.container}>
          <Text style={[styles.errorText, { color: theme.colors.text.primary }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.colors.primary[500] }]}
            onPress={handleBack}
          >
            <Text style={styles.backButtonText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 거래 데이터 파싱
  let transaction: any = null;
  if (transactionData) {
    try {
      transaction = JSON.parse(transactionData);
    } catch (error) {
      console.error('거래 데이터 파싱 오류:', error);
    }
  }

  // 로딩 중일 때
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
        <View style={styles.loadingContainer}>
          {/* 영수증 이미지 */}
          <View style={styles.receiptContainer}>
            {imageLoaded ? (
              <Image 
                source={require('@/src/assets/images/dashboard/ocr.png')}
                style={styles.receiptImage}
                contentFit="contain"
                transition={0}
                cachePolicy="memory-disk"
                priority="high"
                recyclingKey="ocr-receipt"
              />
            ) : (
              <View style={[styles.receiptImage, { backgroundColor: '#F0F0F0' }]} />
            )}
            
            {/* 스캐너 레이저 */}
            {imageLoaded && <Animated.View style={[styles.scannerLine, scannerAnimatedStyle]} />}
          </View>

          <Text style={[styles.loadingText, { color: theme.colors.text.primary }]}>
            영수증을 분석하고 있습니다...
          </Text>
          <Text style={[styles.loadingSubText, { color: theme.colors.text.secondary }]}>
            잠시만 기다려주세요
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isLoading && !ocrResult) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
        <View style={styles.container}>
          <Text style={[styles.errorText, { color: theme.colors.text.primary }]}>
            OCR 결과를 불러올 수 없습니다.
          </Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.colors.primary[500] }]}
            onPress={handleBack}
          >
            <Text style={styles.backButtonText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack}>
            <Text style={[styles.backButtonText, { color: theme.colors.primary[500] }]}>
              ← 돌아가기
            </Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
            OCR 결과
          </Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* 거래 정보 */}
          {transaction && (
            <View style={[styles.section, { backgroundColor: theme.colors.background.secondary }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                거래 정보
              </Text>
              <Text style={[styles.merchantName, { color: theme.colors.text.primary }]}>
                {transaction?.summary || transaction?.opponentName}
              </Text>
              <Text style={[styles.amount, { color: theme.colors.text.primary }]}>
                {(transaction?.type === '출금' || transaction?.type === '출금(이체)') ? '-' : ''}{transaction?.amount ? Number(transaction.amount).toLocaleString() : '0'}원
              </Text>
            </View>
          )}

          {/* OCR 결과 */}
          <View style={[styles.section, { backgroundColor: theme.colors.background.secondary }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              영수증 정보
            </Text>
            
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.colors.text.secondary }]}>
                상호명
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text.primary }]}>
                {ocrResult?.storeName || 'N/A'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.colors.text.secondary }]}>
                날짜
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text.primary }]}>
                {ocrResult?.date || 'N/A'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.colors.text.secondary }]}>
                시간
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text.primary }]}>
                {ocrResult?.time || 'N/A'}
              </Text>
            </View>
          </View>

          {/* 항목 목록 */}
          <View style={[styles.section, { backgroundColor: theme.colors.background.secondary }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              구매 항목 ({ocrResult?.items?.length || 0}개)
            </Text>
            
            {ocrResult?.items?.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, { color: theme.colors.text.primary }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.itemQuantity, { color: theme.colors.text.secondary }]}>
                    {item.quantity}개
                  </Text>
                </View>
                <Text style={[styles.itemPrice, { color: theme.colors.text.primary }]}>
                  {Number(item.price).toLocaleString()}원
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* 하단 버튼 */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.confirmButton, { backgroundColor: theme.colors.primary[500] }]}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmButtonText}>확인</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  section: {
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: Spacing.base,
  },
  merchantName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 12,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  confirmButton: {
    paddingVertical: Spacing.base,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  backButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  receiptContainer: {
    width: width * 0.98,
    position: 'relative',
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  receiptImage: {
    width: width * 0.98,
    height: 400,
  },
  scannerLine: {
    position: 'absolute',
    top: 0,
    left: '20%',
    right: '20%',
    height: 3,
    backgroundColor: '#00FF00',
    shadowColor: '#00FF00',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  loadingSubText: {
    fontSize: 14,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
});
