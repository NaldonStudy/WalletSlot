import React, { useState, useRef } from 'react';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, StyleSheet, useColorScheme, Text, TouchableOpacity, Alert, Dimensions, PanResponder, Animated, GestureResponderEvent } from 'react-native';
import { Image } from 'expo-image';
import { Spacing, themes } from '@/src/constants/theme';
import { useNavigation } from '@react-navigation/native';
import * as ImageManipulator from 'expo-image-manipulator';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ImageEditScreen() {
  const { slotId, transactionId, transactionData, slotData, slotName, accountId, accountSlotId, imageUri, entryType } = useLocalSearchParams<{ 
    slotId: string; 
    transactionId: string;
    transactionData?: string;
    slotData?: string;
    slotName?: string;
    accountId?: string;
    accountSlotId?: string;
    imageUri?: string;
    entryType?: string;
  }>();
  
  const colorScheme = useColorScheme() ?? 'light';
  const theme = themes[colorScheme];
  const navigation = useNavigation();
  
  const [isProcessing, setIsProcessing] = useState(false);
  
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;
  const lastScale = useRef(1);
  const lastPan = useRef({ x: 0, y: 0 });

  // PanResponder for image manipulation
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
        scale.setOffset((scale as any)._value);
      },
      onPanResponderMove: (evt, gestureState) => {
        const touches = evt.nativeEvent.touches;
        
        if (touches.length === 2) {
          // 핀치 줌 (두 손가락)
          const touch1 = touches[0];
          const touch2 = touches[1];
          
          const distance = Math.sqrt(
            Math.pow(touch2.pageX - touch1.pageX, 2) + 
            Math.pow(touch2.pageY - touch1.pageY, 2)
          );
          
          if (lastScale.current === 1) {
            lastScale.current = distance / 100; // 초기 거리 기준
          }
          
          const newScale = Math.max(0.5, Math.min(3, distance / 100 / lastScale.current));
          scale.setValue(newScale);
        } else if (touches.length === 1) {
          // 드래그 (한 손가락)
          pan.setValue({
            x: gestureState.dx,
            y: gestureState.dy,
          });
        }
      },
      onPanResponderRelease: () => {
        pan.flattenOffset();
        scale.flattenOffset();
        lastScale.current = (scale as any)._value;
        lastPan.current = {
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        };
      },
    })
  ).current;

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

  const handleCancel = () => {
    router.back();
  };

  const handleConfirm = async () => {
    if (!imageUri) {
      Alert.alert('오류', '이미지를 찾을 수 없습니다.');
      return;
    }

    setIsProcessing(true);
    
    try {
      // 이미지 리사이즈 및 압축
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          { resize: { width: 800 } }, // 너비 800px로 리사이즈
        ],
        {
          compress: 0.8, // 80% 품질로 압축
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      console.log('편집된 이미지:', manipulatedImage.uri);
      
      // OCR 로딩 화면으로 이동
      router.replace({
        pathname: './ocr-loading',
        params: {
          slotId: slotId || '',
          transactionId: transactionId || '',
          transactionData: transactionData || '',
          slotData: slotData || '',
          slotName: slotName || '',
          accountId: accountId || '',
          accountSlotId: accountSlotId || '',
          imageUri: manipulatedImage.uri,
          entryType: entryType || 'gallery', // entryType 전달
        }
      });
      
    } catch (error) {
      console.error('이미지 처리 오류:', error);
      Alert.alert('오류', '이미지 처리에 실패했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
      <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
         {/* 상단 안내 텍스트 */}
         <View style={styles.topContainer}>
           <Text style={[styles.instructionText, { color: theme.colors.text.primary }]}>
             영수증을 프레임 안에 맞춰주세요
           </Text>
         </View>

        {/* 이미지 표시 영역 */}
        <View style={styles.imageContainer}>
          {imageUri && (
            <Animated.View
              style={[
                styles.imageWrapper,
                {
                  transform: [
                    { translateX: pan.x },
                    { translateY: pan.y },
                    { scale: scale },
                  ],
                },
              ]}
              {...panResponder.panHandlers}
            >
              <Image
                source={{ uri: imageUri }}
                style={styles.image}
                contentFit="contain"
                transition={200}
              />
            </Animated.View>
          )}
          
          {/* 프레임 오버레이 */}
          <View style={styles.frameOverlay}>
            <View style={styles.frame} />
          </View>
        </View>

         {/* 하단 버튼 영역 */}
         <View style={styles.bottomContainer}>
           <TouchableOpacity
             style={[styles.button, styles.cancelButton, { borderColor: theme.colors.text.primary }]}
             onPress={handleCancel}
             disabled={isProcessing}
           >
             <Text style={[styles.cancelButtonText, { color: theme.colors.text.primary }]}>취소</Text>
           </TouchableOpacity>
           
           <TouchableOpacity
             style={[styles.button, styles.confirmButton, isProcessing && styles.disabledButton]}
             onPress={handleConfirm}
             disabled={isProcessing}
           >
             <Text style={styles.confirmButtonText}>
               {isProcessing ? '처리 중...' : '확인'}
             </Text>
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
  topContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.base,
  },
  instructionText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  frameOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    width: screenWidth * 0.8,
    height: screenWidth * 0.8 * 1.3, // 3:4 비율
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.base,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.base,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  disabledButton: {
    backgroundColor: '#666666',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
