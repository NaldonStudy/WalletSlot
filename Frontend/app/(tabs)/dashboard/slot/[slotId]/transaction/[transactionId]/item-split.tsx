import React, { useState, useRef } from 'react';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, StyleSheet, useColorScheme, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Button } from '@/src/components/Button';
import { Spacing, themes } from '@/src/constants/theme';
import { useNavigation } from '@react-navigation/native';
import { OCRItem } from '@/src/api/ocr';
import CheckIcon from '@/src/assets/icons/common/check.svg';
import WarningIcon from '@/src/assets/icons/common/warning.svg';
import BottomSheet from '@/src/components/common/BottomSheet';
import { useSlots } from '@/src/hooks/slots/useSlots';
import SlotHeader from '@/src/components/slot/SlotHeader';
import { transactionApi } from '@/src/api';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/src/api/queryKeys';

export default function ItemSplitScreen() {
  const { slotId, transactionId, transactionData, slotData, slotName, accountId, accountSlotId, ocrResultData, entryType } = useLocalSearchParams<{ 
    slotId: string; 
    transactionId: string;
    transactionData?: string;
    slotData?: string;
    slotName?: string;
    accountId?: string;
    accountSlotId?: string;
    ocrResultData?: string;
    entryType?: string; // 'direct', 'camera', 'gallery'
  }>();
  
  const colorScheme = useColorScheme() ?? 'light';
  const theme = themes[colorScheme];
  const navigation = useNavigation();
  const queryClient = useQueryClient();

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

  // 구매 항목 상태 관리
  const [items, setItems] = useState<(OCRItem & { selected: boolean; assignedSlotId?: string })[]>([]);
  
  // 단계 관리
  const [currentStep, setCurrentStep] = useState<'input' | 'assign'>('input');
  
  // 슬롯별 항목 할당 상태
  const [slotAssignments, setSlotAssignments] = useState<{[slotId: string]: number[]}>({});
  
  // 항목 선택 모달 상태
  const [isItemModalVisible, setIsItemModalVisible] = useState(false);
  const [currentSlotId, setCurrentSlotId] = useState<string | null>(null);
  
  // TextInput refs for auto-focus
  const textInputRefs = useRef<(TextInput | null)[]>([]);
  
  // 계좌의 슬롯 목록 가져오기
  const { slots, isLoading: slotsLoading } = useSlots(accountId);
  
  // 모든 슬롯 표시 (현재 슬롯 포함)
  const availableSlots = slots;
  

  // 거래 데이터 파싱
  let transaction: any = null;
  if (transactionData) {
    try {
      transaction = JSON.parse(transactionData);
    } catch (error) {
      console.error('거래 데이터 파싱 오류:', error);
    }
  }

  // OCR 결과 데이터 파싱
  React.useEffect(() => {
    if (ocrResultData) {
      try {
        console.log('OCR 결과 데이터 받음:', ocrResultData);
        const ocrResult = JSON.parse(ocrResultData);
        console.log('파싱된 OCR 결과:', ocrResult);
        
        if (ocrResult.items && Array.isArray(ocrResult.items)) {
          const mappedItems = ocrResult.items.map((item: OCRItem) => ({ 
            ...item, 
            selected: false,
            assignedSlotId: undefined
          }));
          console.log('매핑된 아이템들:', mappedItems);
          setItems(mappedItems);
        } else {
          console.log('OCR 결과에 items가 없음:', ocrResult);
        }
      } catch (error) {
        console.error('OCR 결과 데이터 파싱 오류:', error);
      }
    }
  }, [ocrResultData]);

  const handleAddItem = () => {
    // 빈 항목을 리스트에 추가
    const newItem: OCRItem & { selected: boolean } = {
      name: '',
      quantity: 1,
      price: 0,
      selected: false,
    };
    setItems(prevItems => {
      const newItems = [...prevItems, newItem];
      // 새로 추가된 항목의 입력 필드에 포커스
      setTimeout(() => {
        const newIndex = newItems.length - 1;
        if (textInputRefs.current[newIndex]) {
          textInputRefs.current[newIndex]?.focus();
        }
      }, 100);
      return newItems;
    });
  };


  const handleRemoveItem = (index: number) => {
    setItems(prevItems => prevItems.filter((_, i) => i !== index));
  };

  const handleSelectAll = () => {
    const allSelected = items.every(item => item.selected);
    setItems(prevItems => 
      prevItems.map(item => ({ ...item, selected: !allSelected }))
    );
  };


  const handleNext = () => {
    if (items.length === 0) {
      Alert.alert('알림', '항목을 추가해주세요.');
      return;
    }
    
    // 남은 금액이 0인지 확인
    const totalAmount = transaction?.amount ? Number(transaction.amount) : 0;
    const totalInputAmount = items.reduce((sum, item) => sum + item.price, 0);
    const remainingAmount = totalAmount - totalInputAmount;
    
    if (remainingAmount !== 0) {
      Alert.alert('알림', `남은 금액이 ${remainingAmount.toLocaleString()}원입니다. 모든 금액을 분배해주세요.`);
      return;
    }
    
    setCurrentStep('assign');
  };

  const handleBack = () => {
    if (currentStep === 'assign') {
      setCurrentStep('input');
    } else {
      // entryType에 따라 적절한 화면으로 이동
      if (entryType === 'direct') {
        router.push({
          pathname: './splits',
          params: {
            slotId: slotId || '',
            transactionId: transactionId || '',
            transactionData: transactionData || '',
            slotData: slotData || '',
            slotName: slotName || '',
            accountId: accountId || '',
            accountSlotId: accountSlotId || '',
          }
        });
      } else if (entryType === 'camera') {
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
          }
        });
      } else if (entryType === 'gallery') {
        router.push({
          pathname: './splits',
          params: {
            slotId: slotId || '',
            transactionId: transactionId || '',
            transactionData: transactionData || '',
            slotData: slotData || '',
            slotName: slotName || '',
            accountId: accountId || '',
            accountSlotId: accountSlotId || '',
          }
        });
      } else {
        // 기본값: splits 화면으로
        router.push({
          pathname: './splits',
          params: {
            slotId: slotId || '',
            transactionId: transactionId || '',
            transactionData: transactionData || '',
            slotData: slotData || '',
            slotName: slotName || '',
            accountId: accountId || '',
            accountSlotId: accountSlotId || '',
          }
        });
      }
    }
  };

  const handleSlotItemSelect = (slotId: string) => {
    setCurrentSlotId(slotId);
    setIsItemModalVisible(true);
  };

  const handleItemSelect = (itemIndex: number) => {
    if (currentSlotId) {
      setSlotAssignments(prev => ({
        ...prev,
        [currentSlotId]: [...(prev[currentSlotId] || []), itemIndex]
      }));
      
      setItems(prevItems => 
        prevItems.map((item, index) => 
          index === itemIndex ? { ...item, assignedSlotId: currentSlotId } : item
        )
      );
    }
  };

  const handleItemDeselect = (itemIndex: number) => {
    if (currentSlotId) {
      setSlotAssignments(prev => ({
        ...prev,
        [currentSlotId]: (prev[currentSlotId] || []).filter(index => index !== itemIndex)
      }));
      
      setItems(prevItems => 
        prevItems.map((item, index) => 
          index === itemIndex ? { ...item, assignedSlotId: undefined } : item
        )
      );
    }
  };

  const handleFinalConfirm = async () => {
    if (accountId && transactionId) {
      const assignedItems = items.filter(item => item.assignedSlotId);
      
      if (assignedItems.length === 0) {
        Alert.alert('알림', '모든 항목을 슬롯에 할당해주세요.');
        return;
      }
      
      console.log('분류하기 시작:', {
        assignedItems,
        accountId,
        transactionId
      });
      
      try {
        // 슬롯별로 그룹화하여 API 호출
        const slotGroups: {[slotId: string]: number} = {};
        assignedItems.forEach(item => {
          if (item.assignedSlotId) {
            slotGroups[item.assignedSlotId] = (slotGroups[item.assignedSlotId] || 0) + item.price;
          }
        });
        
        const splits = Object.entries(slotGroups).map(([slotId, amount]) => ({
          accountSlotId: slotId,
          amount: amount
        }));
        
        console.log('분류하기 요청 데이터:', {
          accountId,
          transactionId,
          splits,
          slotGroups
        });
        
        const result = await transactionApi.splitTransaction(accountId, transactionId, splits);
        console.log('분류하기 API 응답:', result);
        
        // 캐시 무효화
        const uniqueSlotIds = Object.keys(slotGroups);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: queryKeys.slots.byAccount(accountId) }),
          queryClient.invalidateQueries({ queryKey: queryKeys.slots.transactions(accountId, accountSlotId || '') }),
          ...uniqueSlotIds.map(slotId => 
            queryClient.invalidateQueries({ queryKey: queryKeys.slots.transactions(accountId, slotId) })
          ),
          queryClient.invalidateQueries({ queryKey: queryKeys.accounts.balance(accountId) }),
        ]);
        
        const totalAmount = assignedItems.reduce((sum, item) => sum + item.price, 0);
        
        // 성공 모달 표시
        Alert.alert(
          '분류 완료', 
          `${totalAmount.toLocaleString()}원이 선택된 슬롯들로 분류되었습니다.`,
          [
            {
              text: '확인',
              onPress: () => {
                // 원래 슬롯 상세 화면으로 이동
                router.push({
                  pathname: '/(tabs)/dashboard/slot/[slotId]',
                  params: {
                    slotId: slotId || '',
                  }
                });
              }
            }
          ]
        );
        
      } catch (error: any) {
        console.error('분류하기 실패:', error);
        Alert.alert('오류', '분류하기에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
      <KeyboardAwareScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={20}
      >
        {/* 거래 정보 섹션 */}
        <View style={styles.transactionInfo}>
          <Text style={[styles.merchantName, { color: theme.colors.text.primary }]}>
            {transaction?.summary || transaction?.opponentName }
          </Text>
          <Text style={[styles.amount, { color: theme.colors.text.primary }]}>
            {(transaction?.type === '출금' || transaction?.type === '출금(이체)') ? '-' : ''}{transaction?.amount ? Number(transaction.amount).toLocaleString() : '0'}원
          </Text>
        </View>

        {currentStep === 'input' ? (
          /* 구매 항목 입력 섹션 */
          <View style={styles.itemsSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                구매 항목 ({items.length}개)
              </Text>
              <View style={styles.headerRight}>
                {items.length > 0 && (
                  <View style={styles.remainingAmountHeader}>
                    <Text style={[styles.remainingAmountLabel, { color: theme.colors.text.secondary }]}>
                      남은 금액
                    </Text>
                    <Text style={[styles.remainingAmount, { 
                      color: (() => {
                        const totalAmount = transaction?.amount ? Number(transaction.amount) : 0;
                        const totalInputAmount = items.reduce((sum, item) => sum + item.price, 0);
                        const remainingAmount = totalAmount - totalInputAmount;
                        return remainingAmount < 0 ? '#EF4444' : theme.colors.text.primary;
                      })()
                    }]}>
                      {(() => {
                        const totalAmount = transaction?.amount ? Number(transaction.amount) : 0;
                        const totalInputAmount = items.reduce((sum, item) => sum + item.price, 0);
                        return (totalAmount - totalInputAmount).toLocaleString();
                      })()}원
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  style={[styles.addButton, { backgroundColor: theme.colors.primary[500] }]}
                  onPress={handleAddItem}
                >
                  <Text style={styles.addButtonText}>+ 추가</Text>
                </TouchableOpacity>
              </View>
            </View>

            {items.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
                  아직 추가된 항목이 없습니다
                </Text>
                <Text style={[styles.emptySubText, { color: theme.colors.text.secondary }]}>
                  + 추가 버튼을 눌러 항목을 추가하세요
                </Text>
              </View>
            ) : (
              <ScrollView style={styles.itemsList} showsVerticalScrollIndicator={false}>
                {items.map((item, index) => (
                  <View key={index} style={[styles.itemRow, { backgroundColor: theme.colors.background.primary }]}>
                    <View style={styles.itemInputContainer}>
                      <TextInput
                        ref={(ref) => {
                          textInputRefs.current[index] = ref;
                        }}
                        style={[styles.itemTextInput, styles.itemNameInput, { 
                          backgroundColor: '#F3F4F6',
                          color: theme.colors.text.primary,
                          borderColor: '#D1D5DB'
                        }]}
                        value={item.name}
                        onChangeText={(text) => {
                          setItems(prevItems => 
                            prevItems.map((prevItem, i) => 
                              i === index ? { ...prevItem, name: text } : prevItem
                            )
                          );
                        }}
                        placeholder="항목명"
                        placeholderTextColor={theme.colors.text.secondary}
                      />
                      <TextInput
                        style={[styles.itemTextInput, styles.itemPriceInput, { 
                          backgroundColor: '#F3F4F6',
                          color: theme.colors.text.primary,
                          borderColor: '#D1D5DB'
                        }]}
                        value={item.price === 0 ? '' : item.price.toLocaleString()}
                        onChangeText={(text) => {
                          if (text === '') {
                            setItems(prevItems => 
                              prevItems.map((prevItem, i) => 
                                i === index ? { ...prevItem, price: 0 } : prevItem
                              )
                            );
                          } else {
                            const price = parseFloat(text.replace(/[^0-9]/g, '')) || 0;
                            setItems(prevItems => 
                              prevItems.map((prevItem, i) => 
                                i === index ? { ...prevItem, price: price } : prevItem
                              )
                            );
                          }
                        }}
                        placeholder="금액"
                        placeholderTextColor={theme.colors.text.secondary}
                        keyboardType="numeric"
                      />
                    </View>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveItem(index)}
                    >
                      <Text style={[styles.removeButtonText, { color: theme.colors.text.secondary }]}>
                        삭제
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
            
            {/* 경고 메시지 */}
            {items.length > 0 && (() => {
              const totalAmount = transaction?.amount ? Number(transaction.amount) : 0;
              const totalInputAmount = items.reduce((sum, item) => sum + item.price, 0);
              const remainingAmount = totalAmount - totalInputAmount;
              
              if (remainingAmount < 0) {
                return (
                  <View style={styles.warningContainer}>
                    <WarningIcon width={16} height={16} />
                    <Text style={[styles.warningText, { color: '#EF4444' }]}>
                      구매 항목의 총 금액이 거래 내역 금액을 초과했습니다
                    </Text>
                  </View>
                );
              }
              return null;
            })()}
          </View>
        ) : (
          /* 슬롯 할당 섹션 */
          <View style={styles.itemsSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              슬롯별 항목 할당
            </Text>
            
            <View style={styles.slotsContainer}>
              <ScrollView style={styles.slotsList} showsVerticalScrollIndicator={false}>
              {availableSlots.map((slot) => {
                const assignedItems = items.filter(item => item.assignedSlotId === slot.accountSlotId);
                const totalAmount = assignedItems.reduce((sum, item) => sum + item.price, 0);
                
                return (
                  <View key={slot.accountSlotId} style={[styles.slotCard, { backgroundColor: theme.colors.background.primary }]}>
                    {/* 슬롯 헤더 */}
                    <View style={styles.slotCardHeader}>
                      <SlotHeader
                        slot={slot}
                        variant="large"
                      />
                    </View>
                    
                    {/* 잔액 정보 */}
                    <View style={styles.slotBalanceSection}>
                      <View style={styles.balanceRow}>
                        <Text style={[styles.balanceLabel, { color: theme.colors.text.secondary }]}>
                          현재 잔액
                        </Text>
                        <Text style={[styles.balanceValue, { color: theme.colors.text.primary }]}>
                          {slot.remainingBudget.toLocaleString()}원
                        </Text>
                      </View>
                      
                      <View style={styles.balanceRow}>
                        <Text style={[styles.balanceLabel, { color: theme.colors.text.secondary }]}>
                          할당된 금액
                        </Text>
                        <Text style={[styles.balanceValue, { 
                          color: totalAmount > 0 ? theme.colors.primary[500] : theme.colors.text.secondary 
                        }]}>
                          {totalAmount.toLocaleString()}원
                        </Text>
                      </View>
                      
                      <View style={[styles.balanceRow, styles.totalBalanceRow]}>
                        <Text style={[styles.balanceLabel, { 
                          color: theme.colors.text.primary,
                          fontWeight: '600'
                        }]}>
                          예상 잔액
                        </Text>
                        <Text style={[styles.balanceValue, { 
                          color: theme.colors.text.primary,
                          fontWeight: '600'
                        }]}>
                          {(slot.remainingBudget + totalAmount).toLocaleString()}원
                        </Text>
                      </View>
                    </View>
                    
                    {/* 항목 선택 버튼 */}
                    <TouchableOpacity
                      style={[styles.assignButton, { 
                        backgroundColor: assignedItems.length > 0 ? theme.colors.primary[500] : theme.colors.background.secondary,
                        borderWidth: 1,
                        borderColor: assignedItems.length > 0 ? theme.colors.primary[500] : '#E0E0E0'
                      }]}
                      onPress={() => handleSlotItemSelect(slot.accountSlotId)}
                    >
                      <Text style={[styles.assignButtonText, { 
                        color: assignedItems.length > 0 ? '#FFFFFF' : theme.colors.text.primary 
                      }]}>
                        {assignedItems.length > 0 ? `${assignedItems.length}개 항목 할당됨` : '항목 선택'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
              </ScrollView>
            </View>
          </View>
        )}

      </KeyboardAwareScrollView>

      {/* 하단 고정 버튼 */}
      <View style={[styles.fixedBottomContainer, { backgroundColor: theme.colors.background.primary }]}>
        {currentStep === 'input' ? (
          (() => {
            const totalAmount = transaction?.amount ? Number(transaction.amount) : 0;
            const totalInputAmount = items.reduce((sum, item) => sum + item.price, 0);
            const remainingAmount = totalAmount - totalInputAmount;
            const isEnabled = items.length > 0 && remainingAmount === 0 && remainingAmount >= 0;
            
            return (
              <Button
                title="다음"
                onPress={handleNext}
                variant={isEnabled ? 'primary' : 'secondary'}
                size="lg"
                style={styles.completeButton}
                disabled={!isEnabled}
              />
            );
          })()
        ) : (
          <View style={styles.assignButtonsContainer}>
            <Button
              title="이전"
              onPress={handleBack}
              variant="secondary"
              size="lg"
              style={styles.backButton}
            />
            <Button
              title="확인"
              onPress={handleFinalConfirm}
              variant={items.every(item => item.assignedSlotId) ? 'primary' : 'secondary'}
              size="lg"
              style={styles.confirmButton}
              disabled={!items.every(item => item.assignedSlotId)}
            />
          </View>
        )}
      </View>

      {/* 항목 선택 모달 */}
      <BottomSheet 
        visible={isItemModalVisible} 
        onClose={() => {
          setIsItemModalVisible(false);
          setCurrentSlotId(null);
        }} 
        title="항목 선택" 
        height="full"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalText, { color: theme.colors.text.primary }]}>
              {currentSlotId 
                ? `${slots.find(slot => slot.accountSlotId === currentSlotId)?.name || '슬롯'}에 할당할 항목을 선택해주세요`
                : '항목을 선택해주세요'
              }
            </Text>

            <ScrollView style={styles.itemsModalList} showsVerticalScrollIndicator={false}>
              {items.map((item, index) => {
                const isAssigned = item.assignedSlotId;
                const isAssignedToCurrentSlot = item.assignedSlotId === currentSlotId;
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.itemModalRow,
                      {
                        backgroundColor: isAssignedToCurrentSlot 
                          ? theme.colors.primary[100] 
                          : theme.colors.background.primary,
                        borderColor: isAssignedToCurrentSlot 
                          ? theme.colors.primary[500] 
                          : theme.colors.border.light,
                        opacity: isAssigned && !isAssignedToCurrentSlot ? 0.5 : 1,
                      }
                    ]}
                    onPress={() => {
                      if (isAssignedToCurrentSlot) {
                        handleItemDeselect(index);
                      } else if (!isAssigned) {
                        handleItemSelect(index);
                      }
                    }}
                    disabled={!!(isAssigned && !isAssignedToCurrentSlot)}
                  >
                    <View style={styles.itemModalInfo}>
                      <Text style={[styles.itemModalName, { color: theme.colors.text.primary }]}>
                        {item.name || '항목명 없음'}
                      </Text>
                      <Text style={[styles.itemModalPrice, { color: theme.colors.text.secondary }]}>
                        {item.price.toLocaleString()}원
                      </Text>
                    </View>
                    {isAssignedToCurrentSlot && (
                      <CheckIcon width={20} height={20} fill={theme.colors.primary[500]} />
                    )}
                    {isAssigned && !isAssignedToCurrentSlot && (
                      <Text style={[styles.assignedText, { color: theme.colors.text.secondary }]}>
                        할당됨
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={[styles.modalBottomButtonContainer, { backgroundColor: theme.colors.background.primary }]}>
            <Button
              title="확인"
              onPress={() => {
                setIsItemModalVisible(false);
                setCurrentSlotId(null);
              }}
              variant="primary"
              style={styles.modalConfirmButton}
            />
          </View>
        </View>
      </BottomSheet>
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
    marginBottom: Spacing.lg,
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
  itemsSection: {
    flex: 1,
    marginTop: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  remainingAmountHeader: {
    alignItems: 'flex-end',
  },
  selectAllContainer: {
    marginBottom: Spacing.base,
  },
  selectAllButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  selectAllButtonText: {
    fontSize: 12,
  },
  addButton: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
  },
  itemsList: {
    flex: 1,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    borderRadius: 8,
  },
  selectButton: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.base,
    marginLeft: -Spacing.xs,
  },
  itemInputContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  itemTextInput: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    height: 44,
  },
  itemNameInput: {
    flex: 2,
  },
  itemPriceInput: {
    flex: 1,
  },
  removeButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  removeButtonText: {
    fontSize: 12,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 120, // 하단 고정 버튼과 경고 문구를 위한 여백
  },
  fixedBottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    paddingBottom: Spacing.lg,
  },
  completeButton: {
    width: '100%',
  },
  assignButtonsContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  backButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 2,
  },
  slotCard: {
    padding: Spacing.sm,
    paddingTop: Spacing.xs,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: Spacing.base,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  slotsContainer: {
    marginTop: Spacing.lg,
  },
  slotCardHeader: {
    marginBottom: Spacing.sm,
  },
  slotBalanceSection: {
    marginBottom: Spacing.base,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  totalBalanceRow: {
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: Spacing.sm,
    marginBottom: 0,
  },
  balanceLabel: {
    fontSize: 14,
  },
  balanceValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  slotName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  slotAmount: {
    fontSize: 14,
  },
  assignButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assignButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemsModalList: {
    flex: 1,
  },
  itemModalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.base,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  itemModalInfo: {
    flex: 1,
  },
  itemModalName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemModalPrice: {
    fontSize: 14,
  },
  assignedText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  remainingAmountLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  remainingAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  // 모달 스타일
  modalContainer: { 
    flex: 1, 
    flexDirection: 'column' 
  },
  modalContent: { 
    flex: 1, 
    padding: Spacing.lg 
  },
  modalBottomButtonContainer: { 
    padding: Spacing.lg, 
    marginBottom: Spacing.lg 
  },
  modalText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  modalConfirmButton: {},
  slotsSection: { 
    marginBottom: Spacing.lg 
  },
  slotsScrollView: { 
    maxHeight: 200 
  },
  slotsTitle: { 
    fontSize: 14, 
    fontWeight: '500', 
    marginBottom: Spacing.sm 
  },
  loadingText: { 
    fontSize: 14, 
    textAlign: 'center', 
    padding: Spacing.lg 
  },
  slotsList: { 
    gap: Spacing.lg 
  },
  slotItemWrapper: { 
    position: 'relative', 
    marginTop: Spacing.lg 
  },
  slotItem: { 
    flexDirection: 'column', 
    paddingTop: Spacing.lg, 
    paddingBottom: Spacing.base, 
    paddingHorizontal: Spacing.base, 
    borderRadius: 8, 
    borderWidth: 1 
  },
  slotHeaderContainer: { 
    position: 'absolute', 
    top: -Spacing.lg, 
    left: -Spacing.base, 
    zIndex: 2, 
    elevation: 2 
  },
  slotBudget: { 
    fontSize: 14 
  },
  slotBalance: { 
    fontSize: 14, 
    fontWeight: '500' 
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: Spacing.sm,
    marginTop: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: Spacing.sm,
  },
  warningText: {
    fontSize: 14,
    flex: 1,
  },
});
