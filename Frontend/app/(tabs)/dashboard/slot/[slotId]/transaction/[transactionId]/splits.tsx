import React, { useState } from 'react';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, StyleSheet, useColorScheme, Text, Alert, Modal, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Button } from '@/src/components/Button';
import { Spacing, themes } from '@/src/constants/theme';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';

export default function AmountSplitScreen() {
  const { slotId, transactionId, transactionData, slotData, slotName, accountId, accountSlotId } = useLocalSearchParams<{ 
    slotId: string; 
    transactionId: string;
    transactionData?: string;
    slotData?: string;
    slotName?: string;
    accountId?: string;
    accountSlotId?: string;
  }>();
  
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

  // 모달 상태 관리
  const [isActionSheetVisible, setIsActionSheetVisible] = useState(false);

  // 거래 데이터 파싱 (JSON 문자열로 전달된 경우)
  let transaction: any = null;
  if (transactionData) {
    try {
      transaction = JSON.parse(transactionData);
    } catch (error) {
      console.error('거래 데이터 파싱 오류:', error);
    }
  }

  const handleManualSplit = () => {
    // 직접 입력 화면으로 이동
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
        entryType: 'direct', // 직접 입력 표시
      }
    });
  };

  const handleReceiptUpload = () => {
    setIsActionSheetVisible(true);
  };

  const handleCloseActionSheet = () => {
    setIsActionSheetVisible(false);
  };

  const handleTakePhoto = () => {
    setIsActionSheetVisible(false);
    
    // 영수증 스캔 화면으로 이동
    router.push({
      pathname: './receipt-scan',
      params: {
        slotId: slotId || '',
        transactionId: transactionId || '',
        transactionData: transactionData || '',
        slotData: slotData || '',
        slotName: slotName || '',
        accountId: accountId || '',
        accountSlotId: accountSlotId || '',
        entryType: 'camera', // 카메라 표시
      }
    });
  };

  const handleSelectFromAlbum = async () => {
    try {
      // 갤러리 권한 요청
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '갤러리 권한이 필요합니다.');
        return;
      }

      // 갤러리에서 이미지 선택
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // 커스텀 편집 화면 사용
        quality: 1, // 원본 품질로 선택
        base64: false,
        exif: false,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets[0]) {
        console.log('선택된 이미지:', result.assets[0].uri);
        setIsActionSheetVisible(false);
        
        // 커스텀 편집 화면으로 이동
        router.push({
          pathname: './image-edit',
          params: {
            slotId: slotId || '',
            transactionId: transactionId || '',
            transactionData: transactionData || '',
            slotData: slotData || '',
            slotName: slotName || '',
            accountId: accountId || '',
            accountSlotId: accountSlotId || '',
            imageUri: result.assets[0].uri,
            entryType: 'gallery', // 갤러리 표시
          }
        });
      }
    } catch (error) {
      console.error('갤러리 오류:', error);
      Alert.alert('오류', '갤러리를 사용할 수 없습니다.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
      <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
        {/* 거래 정보 섹션 */}
        <View style={styles.transactionInfo}>
          <Text style={[styles.merchantName, { color: theme.colors.text.primary }]}>
            {transaction?.summary || transaction?.opponentName }
          </Text>
          <Text style={[styles.amount, { color: theme.colors.text.primary }]}>
            {(transaction?.type === '출금' || transaction?.type === '출금(이체)') ? '-' : ''}{transaction?.amount ? Number(transaction.amount).toLocaleString() : '0'}원
          </Text>
        </View>

        {/* 중앙 일러스트레이션 */}
        <View style={styles.illustrationContainer}>
          <Image 
            source={require('@/src/assets/images/dashboard/금액나누기.png')}
            style={styles.illustrationImage}
            contentFit="contain"
            transition={200}
            cachePolicy="memory-disk"
          />
        </View>

        {/* 안내 텍스트 */}
        <View style={styles.instructionContainer}>
          <Text style={[styles.instructionText, { color: theme.colors.text.primary }]}>
            한번에 결제한 금액,
          </Text>
          <Text style={[styles.instructionText, { color: theme.colors.text.primary }]}>
            Slot 별로 나눠 드려요!
          </Text>
        </View>

        {/* 액션 버튼들 */}
        <View style={styles.buttonContainer}>
          <Button
            title="직접 나누기"
            variant="outline"
            size="md"
            onPress={handleManualSplit}
            style={styles.actionButton}
          />
          <Button
            title="영수증 업로드"
            variant="outline"
            size="md"
            onPress={handleReceiptUpload}
            style={styles.actionButton}
          />
        </View>
      </View>

      {/* 커스텀 액션 시트 모달 */}
      <Modal
        visible={isActionSheetVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseActionSheet}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCloseActionSheet}
        >
          <TouchableOpacity 
            style={[styles.actionSheet, { backgroundColor: theme.colors.background.primary }]}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.actionSheetTitle, { color: theme.colors.text.primary }]}>
              영수증 업로드
            </Text>
            <Text style={[styles.actionSheetMessage, { color: theme.colors.text.secondary }]}>
              영수증을 어떻게 업로드하시겠습니까?
            </Text>
            
            {/* 카메라와 앨범 버튼 그룹 */}
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.modalActionButton, { backgroundColor: theme.colors.background.primary }]}
                onPress={handleTakePhoto}
              >
                <Text style={[styles.modalActionButtonText, { color: theme.colors.primary[500] }]}>
                  카메라로 촬영
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalActionButton, { backgroundColor: theme.colors.background.primary }]}
                onPress={handleSelectFromAlbum}
              >
                <Text style={[styles.modalActionButtonText, { color: theme.colors.primary[500] }]}>
                  앨범에서 선택
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* 취소 버튼 (분리) */}
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: theme.colors.background.primary }]}
              onPress={handleCloseActionSheet}
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.text.primary }]}>
                취소
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  transactionInfo: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  merchantName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  illustrationImage: {
    width: 300,
    height: 300,
  },
  instructionContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  instructionText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    paddingBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  actionButton: {
    width: '100%',
  },
  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  actionSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl + 20,
  },
  actionSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  actionSheetMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  buttonGroup: {
    marginBottom: Spacing.lg,
  },
  modalActionButton: {
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: Spacing.sm,
  },
  modalActionButtonText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  cancelButton: {
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
});