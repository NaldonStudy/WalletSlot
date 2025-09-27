import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  Alert,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import * as Camera from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Spacing, themes } from '@/src/constants/theme';
import FlashOffIcon from '@/src/assets/icons/common/flash_off.svg';
import FlashOnIcon from '@/src/assets/icons/common/flash_on.svg';
import FlashAutoIcon from '@/src/assets/icons/common/flash_auto.svg';
import CameraIcon from '@/src/assets/icons/common/camera.svg';

const { width, height } = Dimensions.get('window');

interface ReceiptScannerProps {
  onImageCaptured: (imageUri: string) => void;
  onBack: () => void;
  theme: any;
}

export default function ReceiptScanner({ onImageCaptured, onBack, theme }: ReceiptScannerProps) {
  // 카메라 관련 상태
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('off');
  const cameraRef = useRef<any>(null);

  // 카메라 권한 요청
  useEffect(() => {
    const getCameraPermissions = async () => {
      try {
        console.log('[ReceiptScanner] 카메라 권한 요청 시작');
        
        // expo-image-picker를 사용한 권한 확인 (더 안정적)
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        console.log('[ReceiptScanner] 카메라 권한 상태:', status);
        
        if (status === 'granted') {
          setHasPermission(true);
          console.log('[ReceiptScanner] 카메라 권한 허용됨');
        } else {
          setHasPermission(false);
          console.log('[ReceiptScanner] 카메라 권한 거부됨');
        }
      } catch (error) {
        console.error('[ReceiptScanner] 카메라 권한 요청 오류:', error);
        setHasPermission(false);
      }
    };

    // 권한 요청을 약간 지연시켜 컴포넌트가 완전히 마운트된 후 실행
    const timer = setTimeout(() => {
      getCameraPermissions();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // 플래시 토글 함수
  const toggleFlash = () => {
    setFlashMode(prev => {
      switch (prev) {
        case 'off':
          return 'on';
        case 'on':
          return 'auto';
        case 'auto':
          return 'off';
        default:
          return 'off';
      }
    });
  };

  // 사진 촬영 함수
  const handleTakePicture = async () => {
    console.log('[ReceiptScanner] handleTakePicture 호출됨');
    
    if (!cameraRef.current) {
      console.log('[ReceiptScanner] cameraRef가 null입니다');
      return;
    }

    try {
      setIsProcessing(true);
      console.log('[ReceiptScanner] 촬영 시작 - isProcessing: true');
      
      console.log('[ReceiptScanner] takePictureAsync 호출 전');
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1.0, // 최고 품질로 촬영
        base64: false,
        skipProcessing: false,
      });

      console.log('[ReceiptScanner] 촬영 완료:', {
        uri: photo.uri,
        width: photo.width,
        height: photo.height
      });
      
      console.log('[ReceiptScanner] 이미지 압축 시작');
      // 이미지 압축 및 리사이즈
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        photo.uri,
        [
          { resize: { width: 1024 } }, // 너비를 1024px로 리사이즈 (비율 유지)
        ],
        {
          compress: 0.7, // 70% 압축
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      console.log('[ReceiptScanner] 이미지 압축 완료:', {
        uri: manipulatedImage.uri,
        width: manipulatedImage.width,
        height: manipulatedImage.height
      });
      
      console.log('[ReceiptScanner] onImageCaptured 콜백 호출');
      // 부모 컴포넌트로 이미지 URI 전달
      onImageCaptured(manipulatedImage.uri);
      console.log('[ReceiptScanner] onImageCaptured 콜백 완료');
      
    } catch (error) {
      console.error('[ReceiptScanner] 촬영 오류:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      Alert.alert('오류', '영수증 촬영에 실패했습니다.');
    } finally {
      console.log('[ReceiptScanner] finally 블록 - isProcessing: false');
      setIsProcessing(false);
    }
  };

  // 권한이 없는 경우
  if (hasPermission === null) {
    console.log('[ReceiptScanner] 권한 확인 중...');
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        <Text style={[styles.loadingText, { color: theme.colors.text.primary }]}>
          카메라 권한을 확인하는 중...
        </Text>
      </View>
    );
  }

  // 권한이 거부된 경우
  if (hasPermission === false) {
    console.log('[ReceiptScanner] 카메라 권한 거부됨');
    return (
      <View style={styles.centerContainer}>
        <Text style={[styles.errorText, { color: theme.colors.text.primary }]}>
          카메라 권한이 필요합니다.
        </Text>
        <Text style={[styles.errorSubText, { color: theme.colors.text.secondary }]}>
          설정에서 카메라 권한을 허용해주세요.
        </Text>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.colors.primary[500] }]}
          onPress={onBack}
        >
          <Text style={styles.backButtonText}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  console.log('[ReceiptScanner] 카메라 화면 렌더링');
  return (
    <View style={styles.container}>
      {/* 카메라 영역 */}
      <View style={styles.cameraContainer}>
        {/* @ts-ignore */}
        <Camera.CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
          flash={flashMode}
        >
          {/* 스캔 가이드 오버레이 */}
          <View style={styles.overlay}>
            <View style={styles.scanArea}>
              <View style={styles.scanFrame} />
              <View style={styles.scanCorners}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
              </View>
            </View>
            
            {/* 안내 텍스트 */}
            <View style={styles.instructionContainer}>
              <Text style={[styles.instructionText, { color: 'white' }]}>
                영수증을 프레임 안에 맞춰주세요
              </Text>
            </View>
          </View>
        </Camera.CameraView>
      </View>

      {/* 하단 컨트롤 */}
      <View style={styles.controlsContainer}>
        {/* 왼쪽: 돌아가기 버튼 */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
        >
          <Text style={[styles.backButtonText, { color: theme.colors.text.primary }]}>
            돌아가기
          </Text>
        </TouchableOpacity>
        
        {/* 가운데: 촬영 버튼 */}
        <TouchableOpacity
          style={[
            styles.captureButton,
            { 
              backgroundColor: isProcessing ? theme.colors.background.secondary : theme.colors.primary[500],
              opacity: isProcessing ? 0.6 : 1
            }
          ]}
          onPress={handleTakePicture}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <View style={styles.captureButtonInner}>
              <CameraIcon width={24} height={24} fill="#007AFF" />
            </View>
          )}
        </TouchableOpacity>

        {/* 오른쪽: 플래시 버튼 */}
        <TouchableOpacity
          style={styles.flashButton}
          onPress={toggleFlash}
        >
          <View style={styles.flashIconContainer}>
            {flashMode === 'off' && <FlashOffIcon width={28} height={28} fill={theme.colors.text.primary} />}
            {flashMode === 'on' && <FlashOnIcon width={28} height={28} fill={theme.colors.text.primary} />}
            {flashMode === 'auto' && <FlashAutoIcon width={28} height={28} fill={theme.colors.text.primary} />}
          </View>
          <Text style={[styles.flashButtonLabel, { color: theme.colors.text.secondary }]}>
            {flashMode === 'off' ? '꺼짐' : flashMode === 'on' ? '켜짐' : '자동'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  loadingText: {
    fontSize: 16,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  errorSubText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  cameraContainer: {
    flex: 1,
    margin: Spacing.lg,
    borderRadius: 12,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: width * 0.9,
    height: width * 0.7,
    position: 'relative',
  },
  scanFrame: {
    flex: 1,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
  },
  scanCorners: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#007AFF',
    borderWidth: 3,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 8,
  },
  instructionContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing.xl + 20,
  },
  backButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  flashButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  flashIconContainer: {
    marginBottom: 2,
  },
  flashButtonLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
