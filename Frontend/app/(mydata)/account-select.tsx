import { ThemedText } from '@/components/ThemedText';
import { BANK_CODES } from '@/src/constants/banks';
import { useSignupStore } from '@/src/store/signupStore';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const BANK_ICON_SIZE = 60;
const BANK_ICON_MARGIN = 15;
const BANKS_PER_ROW = 6;

// 은행 데이터를 배열로 변환
const bankList = Object.entries(BANK_CODES).map(([code, bank]) => ({
  code,
  ...bank,
}));

export default function AccountSelectScreen() {
  const { name } = useSignupStore();
  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBanks, setSelectedBanks] = useState<Set<string>>(new Set());
  const [pendingNavigateBanks, setPendingNavigateBanks] = useState<string[] | null>(null);
  
  // 애니메이션 값들
  const row1Animation = useRef(new Animated.Value(0)).current;
  const row2Animation = useRef(new Animated.Value(0)).current; // 2행은 왼쪽으로 이동
  const row3Animation = useRef(new Animated.Value(0)).current;

  // 무한 스크롤 애니메이션
  useEffect(() => {
    const totalWidth = (BANK_ICON_SIZE + BANK_ICON_MARGIN * 2) * bankList.length;
    
    // 2행 시작 오프셋 설정
    const ITEM_W = BANK_ICON_SIZE + BANK_ICON_MARGIN * 2;
    // 뒷부분부터 보이게 하고 싶은 시작 인덱스(예: 뒤쪽 60% 지점)
    const START_INDEX_2 = Math.floor(bankList.length * 0.6);
    const START_OFFSET_2 = ITEM_W * START_INDEX_2;

    // 1행, 3행: 오른쪽으로 무한 이동
    const animation1 = Animated.loop(
      Animated.timing(row1Animation, {
        toValue: -totalWidth,
        duration: 20000,
        useNativeDriver: true,
      })
    );
    
    const animation3 = Animated.loop(
      Animated.timing(row3Animation, {
        toValue: -totalWidth,
        duration: 20000,
        useNativeDriver: true,
      })
    );

    // ✅ 2행: 뒷부분부터 시작 → 오른쪽으로 무한 반복
    row2Animation.setValue(-START_OFFSET_2);
    const animation2 = Animated.loop(
      Animated.timing(row2Animation, {
        toValue: 0,              // 오른쪽(+) 방향으로 이동해서 원점에 정지
        duration: 20000,         // 20초
        useNativeDriver: true,
      })
    );

    // 모든 애니메이션 시작
    animation1.start();
    animation2.start();
    animation3.start();

    return () => {
      animation1.stop();
      animation2.stop();
      animation3.stop();
    };
  }, []);

  // 모달이 닫힌 후 내비게이션 수행
  useEffect(() => {
    if (!isModalVisible && pendingNavigateBanks && pendingNavigateBanks.length > 0) {
      const timer = setTimeout(() => {
        router.push({
          pathname: '/(mydata)/mydata-consent',
          params: { banks: JSON.stringify(pendingNavigateBanks) },
        } as any);
        setPendingNavigateBanks(null);
      }, 30); // 닫힘 애니메이션 시간 대기
      return () => clearTimeout(timer);
    }
  }, [isModalVisible, pendingNavigateBanks]);

  // 은행 선택 토글
  const toggleBankSelection = (bankCode: string) => {
    setSelectedBanks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bankCode)) {
        newSet.delete(bankCode);
      } else {
        newSet.add(bankCode);
      }
      return newSet;
    });
  };

  // 모두 선택/해제
  const toggleAllBanks = () => {
    if (selectedBanks.size === bankList.length) {
      setSelectedBanks(new Set());
    } else {
      setSelectedBanks(new Set(bankList.map(bank => bank.code)));
    }
  };

  // 애니메이션된 은행 행 렌더링
  const renderAnimatedBankRow = (animatedValue: Animated.Value, rowIndex: number) => {
    // 모든 행에 모든 은행을 표시하되, 순서를 다르게 배치
    const shuffledBanks = [...bankList];
    // 각 행마다 다른 순서로 섞기
    for (let i = shuffledBanks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)) + rowIndex;
      [shuffledBanks[i], shuffledBanks[j % shuffledBanks.length]] = [shuffledBanks[j % shuffledBanks.length], shuffledBanks[i]];
    }
    
    const rowBanks = [
      ...shuffledBanks,
      ...shuffledBanks,
      ...shuffledBanks,
      ...shuffledBanks,
      ...shuffledBanks,
      ...shuffledBanks,
    ];

    return (
      <Animated.View
        style={[
          styles.bankRow,
          {
            transform: [{ translateX: animatedValue }],
          },
        ]}
      >
        {rowBanks.map((bank, index) => (
          <View key={`${rowIndex}-${index}`} style={styles.bankIconContainer}>
            <View style={styles.bankIconWrapper}>
              <Image source={bank.logo} style={styles.bankIcon} resizeMode="contain" />
            </View>
          </View>
        ))}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 타원형 그라데이션 배경 이미지 */}
      <Image 
        source={require('@/src/assets/images/backgroundstyle/ellipseback.png')} 
        style={styles.backgroundImage}
        resizeMode="contain"
      />
      
      {/* 헤더 */}
      <View style={styles.header}>
        <ThemedText style={styles.title}>
          {name || '사용자'}님의{'\n'}
           계좌를 한 번에 찾아보세요
        </ThemedText>
      </View>

      {/* 은행 아이콘 애니메이션 영역 */}
      <View style={styles.bankAnimationContainer}>
        {renderAnimatedBankRow(row1Animation, 0)}
        {renderAnimatedBankRow(row2Animation, 1)}
        {renderAnimatedBankRow(row3Animation, 2)}
      </View>

      {/* 하단 버튼 영역 */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.bankCountButton}
          onPress={() => setIsModalVisible(true)}
        >
          <ThemedText style={styles.bankCountText}>
            {selectedBanks.size}개 은행 선택
          </ThemedText>
          <ThemedText style={styles.chevron}>⌄</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.confirmButton}
          onPress={() => setIsModalVisible(true)}
        >
          <ThemedText style={styles.confirmButtonText}>확인</ThemedText>
        </TouchableOpacity>
      </View>

      {/* 은행 선택 모달 */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* 모달 헤더 */}
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>
                {selectedBanks.size}개 은행 선택
              </ThemedText>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <ThemedText style={styles.closeButton}>✕</ThemedText>
              </TouchableOpacity>
            </View>

            {/* 모두 선택/해제 버튼 */}
            <TouchableOpacity style={styles.selectAllButton} onPress={toggleAllBanks}>
              <ThemedText style={styles.selectAllText}>
                {selectedBanks.size === bankList.length ? '모두 해제' : '모두 선택'}
              </ThemedText>
            </TouchableOpacity>

            {/* 은행 목록 - 2열 그리드 */}
            <FlatList
              data={bankList}
              numColumns={2}
              keyExtractor={(item) => item.code}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              style={styles.bankList}
              renderItem={({ item: bank }) => (
                <TouchableOpacity
                  style={styles.bankItem}
                  onPress={() => toggleBankSelection(bank.code)}
                >
                  <Image source={bank.logo} style={styles.bankItemIcon} resizeMode="contain" />
                  <ThemedText style={styles.bankItemName}>{bank.shortName}</ThemedText>
                  <View style={[
                    styles.checkbox,
                    selectedBanks.has(bank.code) && styles.checkboxSelected
                  ]}>
                    {selectedBanks.has(bank.code) && (
                      <ThemedText style={styles.checkmark}>✓</ThemedText>
                    )}
                  </View>
                </TouchableOpacity>
              )}
            />

            {/* 모달 하단 버튼들 */}
            <View style={styles.modalBottom}>
              {(() => {
                const isConnectEnabled = selectedBanks.size > 0;
                return (
                  <TouchableOpacity
                    disabled={!isConnectEnabled}
                    style={[
                      styles.connectButton,
                      isConnectEnabled ? styles.connectEnabled : styles.connectDisabled,
                    ]}
                    onPress={() => {
                      if (!isConnectEnabled) return;
                      const selected = Array.from(selectedBanks);
                      setPendingNavigateBanks(selected);
                      setIsModalVisible(false); // 먼저 모달 닫기
                    }}
                  >
                    <ThemedText style={[
                      styles.connectButtonText,
                      !isConnectEnabled && styles.connectButtonTextDisabled,
                    ]}>연결하러 가기</ThemedText>
                  </TouchableOpacity>
                );
              })()}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backgroundImage: {
    position: 'absolute',
    top: '25%',
    left: '-2%',
    right: '2%',
    bottom: '25%',
    width: '110%',
    height: '50%',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    height: 160,
  },
  title: {
    fontSize: 24,
    position: 'absolute',
    top: 150,
    left: 0,
    right: 0,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  bankAnimationContainer: {
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  bankIconContainer: {
    marginHorizontal: BANK_ICON_MARGIN,
  },
  bankIconWrapper: {
    width: BANK_ICON_SIZE,
    height: BANK_ICON_SIZE,
    borderRadius: BANK_ICON_SIZE / 2,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bankIcon: {
    width: BANK_ICON_SIZE - 20,
    height: BANK_ICON_SIZE - 20,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  bankCountButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 15,
  },
  bankCountText: {
    fontSize: 16,
    color: '#333',
  },
  chevron: {
    fontSize: 18,
    color: '#666',
  },
  confirmButton: {
    backgroundColor: '#2383BD',
    paddingVertical: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 20,
    color: '#666',
  },
  selectAllButton: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectAllText: {
    fontSize: 16,
    color: '#2383BD',
    fontWeight: '500',
  },
  bankList: {
    maxHeight: 360,
    paddingHorizontal: 10,
    flexGrow: 0,
  },
  bankItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 15,
    marginHorizontal: 5,
    marginVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  bankItemIcon: {
    width: 30,
    height: 30,
    marginRight: 15,
  },
  bankItemName: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#2383BD',
    borderColor: '#2383BD',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalBottom: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  
  connectButton: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  connectEnabled: {
    backgroundColor: '#2383BD',
  },
  connectDisabled: {
    backgroundColor: '#E9ECEF',
  },
  connectButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  connectButtonTextDisabled: {
    color: '#9AA0A6',
  },
});