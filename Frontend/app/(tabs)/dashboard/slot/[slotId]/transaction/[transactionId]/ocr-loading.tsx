import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect , useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  interpolate 
} from 'react-native-reanimated';

import { Spacing, themes } from '@/src/constants/theme';
import { ocrApi } from '@/src/api/ocr';
import { getDeviceId } from '@/src/services/deviceIdService';

const { width } = Dimensions.get('window');
const theme = themes.light;

export default function OCRLoadingScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const { 
    slotId, 
    transactionId, 
    transactionData, 
    slotData, 
    slotName, 
    accountId, 
    accountSlotId, 
    imageUri, 
    ocrResultData,
    entryType
  } = params;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<any>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // 스캐너 애니메이션
  const scannerPosition = useSharedValue(0);

  // 탭 바 숨기기
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

  // 스캐너 애니메이션 시작
  useEffect(() => {
    if (imageLoaded) {
      scannerPosition.value = withRepeat(
        withTiming(1, { duration: 2000 }),
        -1,
        true
      );
    }
  }, [imageLoaded]);

  // OCR API 호출
  useEffect(() => {
    const processOCR = async () => {
      try {
        let finalOcrResult = null;
        
        if (imageUri) {
          // 이미지 URI가 있으면 OCR API 호출
          const deviceId = await getDeviceId();

          if (!deviceId) {
            throw new Error('디바이스 ID를 가져올 수 없습니다.');
          }

          const result = await ocrApi.processReceipt(imageUri as string, deviceId);
          console.log('[OCRResult] OCR API 호출 완료:', result);          
          setOcrResult(result);
          finalOcrResult = result;
        } else if (ocrResultData) {
          // OCR 결과 데이터가 있으면 파싱
          const parsedResult = JSON.parse(ocrResultData as string);
          setOcrResult(parsedResult);
          finalOcrResult = parsedResult;
        } else {
          throw new Error('OCR 처리할 데이터가 없습니다.');
        }
        
        // 로딩 완료 후 바로 item-split으로 이동
        setTimeout(() => {
          setIsLoading(false);
          
          // OCR 결과를 item-split 화면으로 전달
          const ocrResultString = JSON.stringify(finalOcrResult);
          console.log('[OCRResult] 최종 전달할 OCR 결과:', ocrResultString);
          
          router.push({
            pathname: './item-split',
            params: {
              slotId: slotId || '',
              transactionId: transactionId || '',
              transactionData: transactionData || '',
              slotData: slotData || '',
              slotName: slotName || '',
              accountId: accountId || '',
              accountSlotId: accountSlotId || '',
              ocrResultData: ocrResultString,
              entryType: entryType || 'camera', // entryType 전달
            }
          });
        }, 1000); // 1초 후 로딩 완료
        
      } catch (error) {
        console.error('[OCRResult] OCR 처리 오류:', error);
        setError(error instanceof Error ? error.message : 'OCR 처리에 실패했습니다.');
        setIsLoading(false);
      }
    };

    processOCR();
  }, [imageUri, ocrResultData]);

  // 스캐너 애니메이션 스타일
  const scannerAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scannerPosition.value,
      [0, 1],
      [-120, 120] // 이미지 크기에 맞춰 스캔 범위 조정
    );

    return {
      transform: [{ translateY }],
    };
  });

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
        <View style={styles.container}>
          <Text style={[styles.errorText, { color: theme.colors.text.primary }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.colors.primary[500] }]}
            onPress={() => router.back()}
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
        {/* 스캐너 애니메이션 */}
        <View style={styles.scannerContainer}>
          <Image
            source={require('@/src/assets/images/dashboard/ocr.png')}
            style={styles.receiptImage}
            contentFit="contain"
            transition={200}
            cachePolicy="memory-disk"
            onLoad={() => setImageLoaded(true)}
          />
          
          {/* 스캐너 라인 */}
          <Animated.View
            style={[
              styles.scannerLine,
              scannerAnimatedStyle,
            ]}
          />
        </View>

        {/* 로딩 텍스트 */}
        <View style={styles.loadingTextContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text.primary }]}>
            영수증을 분석하고 있습니다...
          </Text>
          <Text style={[styles.loadingSubText, { color: theme.colors.text.secondary }]}>
            잠시만 기다려주세요
          </Text>
        </View>
      </View>ㄷ
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerContainer: {
    width: '60%',
    height: '40%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  receiptImage: {
    width: '100%',
    height: '100%',
  },
  scannerLine: {
    position: 'absolute',
    width: '100%',
    height: 4,
    backgroundColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 8,
  },
  loadingTextContainer: {
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  loadingSubText: {
    fontSize: 14,
    fontWeight: '400',
    marginTop: Spacing.xs,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  backButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});