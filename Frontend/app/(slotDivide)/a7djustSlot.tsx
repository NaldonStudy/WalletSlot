import { BANK_CODES } from '@/src/constants/banks';
import { SLOT_CATEGORIES } from '@/src/constants/slots';
import { useSlotDivideStore } from '@/src/store/slotDivideStore';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function A7djustSlotScreen() {
  const { accountId } = useLocalSearchParams<{ accountId: string }>();
  const { getRecommendationResult } = useSlotDivideStore();
  const recommendationData = getRecommendationResult();

  // 추천 응답 데이터 디버깅용 콘솔 출력
  React.useEffect(() => {
    if (recommendationData) {
      console.log('🎯 [A7DJUST_SLOT] 추천 응답 데이터 전체:', JSON.stringify(recommendationData, null, 2));
      console.log('🎯 [A7DJUST_SLOT] 성공 여부:', recommendationData.success);
      console.log('🎯 [A7DJUST_SLOT] 메시지:', recommendationData.message);
      console.log('🎯 [A7DJUST_SLOT] 은행 정보:', recommendationData.data.bank);
      console.log('🎯 [A7DJUST_SLOT] 계좌 정보:', recommendationData.data.account);
      console.log('🎯 [A7DJUST_SLOT] 추천 슬롯 개수:', recommendationData.data.recommededSlots.length);
      console.log('🎯 [A7DJUST_SLOT] 추천 슬롯 목록:', recommendationData.data.recommededSlots);
    } else {
      console.log('🎯 [A7DJUST_SLOT] 추천 데이터 없음 - recommendationData가 null입니다.');
    }
  }, [recommendationData]);

  const handleGoBack = () => {
    router.back();
  };

  // accountId가 없으면 대시보드로 돌아가기
  React.useEffect(() => {
    if (!accountId) {
      console.log('🎯 [A7DJUST_SLOT] accountId가 없어서 대시보드로 이동');
      router.replace('/(tabs)/dashboard');
    }
  }, [accountId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  const handleDeleteSlot = (slotId: string) => {
    console.log('🎯 [DELETE_SLOT] 슬롯 삭제:', slotId);
    // TODO: 슬롯 삭제 API 연동
  };

  const handleEditSlot = (slotId: string) => {
    console.log('🎯 [EDIT_SLOT] 슬롯 수정:', slotId);
    // TODO: 슬롯 수정 모달 표시
  };

  const handleAddSlot = () => {
    console.log('🎯 [ADD_SLOT] 슬롯 추가');
    // TODO: 슬롯 추가 모달 표시
  };

  const handleConfirm = () => {
    console.log('🎯 [CONFIRM] 예산안 확정');
    // TODO: 예산안 확정 API 연동
  };

  // 은행 정보 가져오기
  const getBankInfo = (bankId: string) => {
    return BANK_CODES[bankId as keyof typeof BANK_CODES] || {
      name: '알 수 없는 은행',
      shortName: '알수없음',
      color: '#6B7280',
      logo: null
    };
  };

  // 슬롯 카테고리 정보 가져오기
  const getSlotInfo = (slotId: string) => {
    return SLOT_CATEGORIES[slotId as keyof typeof SLOT_CATEGORIES] || {
      label: '기타',
      icon: null,
      color: '#6B7280'
    };
  };

  // accountId가 없으면 로딩 화면 표시
  if (!accountId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
              <Text style={styles.backButtonText}>← 뒤로</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>슬롯 조정</Text>
            <View style={styles.headerSpacer} />
          </View>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>계좌 정보를 불러올 수 없습니다.</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleGoBack}>
              <Text style={styles.retryButtonText}>대시보드로 돌아가기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Text style={styles.backButtonText}>← 뒤로</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>슬롯 조정</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {recommendationData ? (
            <>
              {/* 계좌 정보 카드 */}
              <View style={styles.accountCard}>
                <View style={styles.accountHeader}>
                  {(() => {
                    const bankInfo = getBankInfo(recommendationData.data.bank.bankId);
                    return (
                      <View style={styles.bankInfo}>
                        {bankInfo.logo && (
                          <Image source={bankInfo.logo} style={styles.bankLogo} resizeMode="contain" />
                        )}
                        <View style={styles.bankText}>
                          <Text style={[styles.bankName, { color: bankInfo.color }]}>
                            {bankInfo.name}
                          </Text>
                          <Text style={styles.accountNo}>
                            {recommendationData.data.account.accountNo}
                          </Text>
                        </View>
                      </View>
                    );
                  })()}
                </View>
                <View style={styles.balanceContainer}>
                  <Text style={styles.balanceLabel}>계좌 잔액</Text>
                  <Text style={styles.balanceAmount}>
                    {formatCurrency(recommendationData.data.account.accountBalance)}
                  </Text>
                </View>
              </View>

              {/* 슬롯 목록 */}
              <View style={styles.slotsSection}>
                <Text style={styles.sectionTitle}>
                  추천 슬롯 ({recommendationData.data.recommededSlots.length}개)
                </Text>
                
                {recommendationData.data.recommededSlots.map((slot, index) => {
                  const slotInfo = getSlotInfo(slot.slotId);
                  const SlotIcon = slotInfo.icon;
                  
                  return (
                    <View key={slot.slotId} style={styles.slotCard}>
                      {/* 삭제 버튼 */}
                      <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={() => handleDeleteSlot(slot.slotId)}
                      >
                        <Text style={styles.deleteButtonText}>−</Text>
                      </TouchableOpacity>

                      {/* 슬롯 정보 */}
                      <View style={styles.slotContent}>
                        <View style={styles.slotHeader}>
                          <View style={styles.slotInfo}>
                            {SlotIcon && (
                              <View style={[styles.slotIconContainer, { backgroundColor: slotInfo.color + '20' }]}>
                                <SlotIcon width={24} height={24} />
                              </View>
                            )}
                            <View style={styles.slotText}>
                              <Text style={styles.slotName}>{slot.name}</Text>
                              <Text style={styles.slotCategory}>{slotInfo.label}</Text>
                            </View>
                          </View>
                          
                          {/* 수정 버튼 */}
                          <TouchableOpacity 
                            style={styles.editButton}
                            onPress={() => handleEditSlot(slot.slotId)}
                          >
                            <Text style={styles.editButtonText}>✏️</Text>
                          </TouchableOpacity>
                        </View>
                        
                        <View style={styles.budgetContainer}>
                          <Text style={styles.budgetLabel}>예산</Text>
                          <Text style={styles.budgetAmount}>
                            {formatCurrency(slot.initialBudget)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}

                {/* 슬롯 추가 버튼 */}
                <TouchableOpacity style={styles.addSlotButton} onPress={handleAddSlot}>
                  <Text style={styles.addSlotButtonText}>+ 슬롯 추가하기</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>추천 데이터를 불러올 수 없습니다.</Text>
              <TouchableOpacity style={styles.retryButton} onPress={handleGoBack}>
                <Text style={styles.retryButtonText}>다시 시도</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* 하단 확인 버튼 */}
        {recommendationData && (
          <View style={styles.bottomContainer}>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <Text style={styles.confirmButtonText}>예산안 확정</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
  },
  
  // 헤더 스타일
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  headerSpacer: {
    width: 60,
  },
  
  // 컨텐츠 스타일
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  // 계좌 카드 스타일
  accountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  accountHeader: {
    marginBottom: 16,
  },
  bankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankLogo: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  bankText: {
    flex: 1,
  },
  bankName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  accountNo: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  balanceContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#059669',
  },
  
  // 슬롯 섹션 스타일
  slotsSection: {
    marginBottom: 100, // 하단 버튼 공간 확보
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  
  // 슬롯 카드 스타일
  slotCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  deleteButton: {
    position: 'absolute',
    top: -8,
    left: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  slotContent: {
    padding: 20,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  slotInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  slotIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  slotText: {
    flex: 1,
  },
  slotName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  slotCategory: {
    fontSize: 14,
    color: '#6B7280',
  },
  editButton: {
    padding: 8,
  },
  editButtonText: {
    fontSize: 16,
  },
  budgetContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  budgetLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  budgetAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
  },
  
  // 슬롯 추가 버튼 스타일
  addSlotButton: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    marginTop: 8,
  },
  addSlotButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  
  // 하단 컨테이너
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  confirmButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // 에러 스타일
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
