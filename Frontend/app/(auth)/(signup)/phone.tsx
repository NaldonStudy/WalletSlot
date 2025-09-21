import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, Modal, Animated, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSignupStore } from '@/src/store/signupStore';

export default function PhoneScreen() {
  const [phone, setPhone] = useState('010-');
  const [selectedCarrier, setSelectedCarrier] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [allAgreed, setAllAgreed] = useState(false);
  const [terms, setTerms] = useState({
    service: false,
    privacy: false,
    consignment: false,
    openBanking: false,
  });
  const [openBankingExpanded, setOpenBankingExpanded] = useState(false);
  const [openBankingSubTerms, setOpenBankingSubTerms] = useState({
    service: false,
    privacy: false,
    thirdParty: false,
  });
  const { name, carrier, residentFront6, residentBack1, setPhone: setStorePhone, isPhoneValid, clearName, clearResidentId, clearPhone } = useSignupStore();

  const carriers = ['SKT', 'KT', 'LG U+', '알뜰폰'];

  // 애니메이션 값들
  const residentIdFieldTranslateY = useState(new Animated.Value(0))[0];
  const nameFieldTranslateY = useState(new Animated.Value(0))[0];
  const phoneFieldOpacity = useState(new Animated.Value(0))[0];
  const phoneFieldTranslateY = useState(new Animated.Value(0))[0];
  
  // 드롭다운 열림/닫힘에 따른 애니메이션
  const dropdownOffset = useState(new Animated.Value(0))[0];
  
  // 약관 동의 모달 애니메이션
  const overlayOpacity = useState(new Animated.Value(0))[0];
  const termsBlockTranslateY = useState(new Animated.Value(300))[0];
  const termsBlockOpacity = useState(new Animated.Value(0))[0];

  // 컴포넌트 마운트 시 스토어 값으로 로컬 상태 초기화
  useEffect(() => {
    if (carrier) {
      setSelectedCarrier(carrier);
    }
    if (phone && phone.length === 11) {
      // 스토어의 phone은 숫자만 저장되어 있으므로 포맷팅 (11자리일 때만)
      const formatted = `010-${phone.slice(3, 7)}-${phone.slice(7)}`;
      setPhone(formatted);
    }
  }, []);

  // 컴포넌트 마운트 시 애니메이션 실행
  useEffect(() => {
    // 1단계: 주민등록번호와 이름 입력칸이 함께 아래로 슬라이드
    Animated.parallel([
      Animated.timing(residentIdFieldTranslateY, {
        toValue: 50,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(nameFieldTranslateY, {
        toValue: 50,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 2단계: 휴대폰 번호 입력칸이 나타나면서 위로 슬라이드
      Animated.parallel([
        Animated.timing(phoneFieldOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(phoneFieldTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  const handlePhoneChange = (text: string) => {
    // 010-으로 시작하는지 확인
    if (!text.startsWith('010-')) {
      setPhone('010-');
      return;
    }

    // 숫자만 추출
    const numbers = text.replace(/[^0-9]/g, '');
    
    // 010으로 시작하는 11자리 숫자만 허용
    if (numbers.length <= 11 && numbers.startsWith('010')) {
      let formatted = '010-';
      
      if (numbers.length > 3) {
        formatted += numbers.slice(3, 7);
      }
      if (numbers.length > 7) {
        formatted += '-' + numbers.slice(7, 11);
      }
      
      setPhone(formatted);
      // 스토어에는 하이픈 없이 저장 (통신사가 선택되어 있으면)
      if (selectedCarrier) {
        setStorePhone(selectedCarrier as any, numbers);
      }
    }
  };

  const handleCarrierSelect = (carrier: string) => {
    setSelectedCarrier(carrier);
    setIsDropdownOpen(false);
    // 드롭다운 닫힘 애니메이션: 아래 입력칸들이 위로 올라오도록
    Animated.timing(dropdownOffset, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    // 통신사 선택 시 스토어에 저장
    if (phone && phone !== '010-') {
      const numbers = phone.replace(/[^0-9]/g, '');
      setStorePhone(carrier as any, numbers);
    }
  };

  const toggleDropdown = () => {
    const newState = !isDropdownOpen;
    setIsDropdownOpen(newState);
    // 드롭다운 열림/닫힘에 따라 아래 입력칸들이 부드럽게 이동
    Animated.timing(dropdownOffset, {
      toValue: newState ? 150 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleVerifyIdentity = () => {
    if (!isPhoneValid()) {
      alert('통신사와 휴대폰 번호를 모두 입력해주세요!');
      return;
    }
    
    // 약관 동의 모달 표시
    setShowTermsModal(true);
    
    // 모달 애니메이션 시작
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(termsBlockTranslateY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(termsBlockOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleAllAgree = () => {
    const newValue = !allAgreed;
    setAllAgreed(newValue);
    setTerms({
      service: newValue,
      privacy: newValue,
      consignment: newValue,
      openBanking: newValue,
    });
    setOpenBankingSubTerms({
      service: newValue,
      privacy: newValue,
      thirdParty: newValue, // 전체 동의는 고지도 포함
    });
  };

  const handleTermAgree = (term: keyof typeof terms) => {
    const newTerms = { ...terms, [term]: !terms[term] };
    setTerms(newTerms);
    
    // 오픈뱅킹 기본 동의를 클릭한 경우 하위 모든 항목들 체크/해제
    if (term === 'openBanking') {
      setOpenBankingSubTerms({
        service: newTerms.openBanking,
        privacy: newTerms.openBanking,
        thirdParty: newTerms.openBanking,
      });
    }
    
    // 모든 약관이 동의되었는지 확인
    const allTermsAgreed = Object.values(newTerms).every(agreed => agreed) && 
                          Object.values(openBankingSubTerms).every(agreed => agreed);
    setAllAgreed(allTermsAgreed);
  };

  const handleOpenBankingSubTermAgree = (subTerm: keyof typeof openBankingSubTerms) => {
    const newSubTerms = { ...openBankingSubTerms, [subTerm]: !openBankingSubTerms[subTerm] };
    setOpenBankingSubTerms(newSubTerms);
    
    // 필수 하위 약관들만 확인 (service, privacy만 필수, thirdParty는 고지)
    const requiredSubTermsAgreed = newSubTerms.service && newSubTerms.privacy;
    console.log('하위 약관 상태:', newSubTerms);
    console.log('필수 하위 약관 동의:', requiredSubTermsAgreed);
    
    setTerms({ ...terms, openBanking: requiredSubTermsAgreed });
    
    // 전체 동의 상태 확인 (모든 약관 + 모든 하위 약관)
    const allTermsAgreed = Object.values({ ...terms, openBanking: requiredSubTermsAgreed }).every(agreed => agreed) && 
                          Object.values(newSubTerms).every(agreed => agreed);
    setAllAgreed(allTermsAgreed);
  };

  const toggleOpenBankingExpansion = () => {
    setOpenBankingExpanded(!openBankingExpanded);
  };

  const handleConfirm = () => {
    if (!terms.service || !terms.privacy || !terms.consignment || !terms.openBanking) {
      alert('필수 약관에 모두 동의해주세요.');
      return;
    }
    router.replace('/(tabs)/dashboard');
  };

  const handleClose = () => {
    // 애니메이션과 함께 닫기
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(termsBlockTranslateY, {
        toValue: 300,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(termsBlockOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowTermsModal(false);
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <Text style={styles.title}>휴대폰 번호를 입력해주세요.</Text>

          {/* 휴대폰 번호 입력칸 */}
          <Animated.View 
            style={[
              styles.fieldBlock,
              {
                opacity: phoneFieldOpacity,
                transform: [{ translateY: phoneFieldTranslateY }],
              },
            ]}
          >
            <Text style={styles.label}>휴대폰 번호</Text>
            <View style={styles.phoneContainer}>
              {/* 통신사 선택 버튼 */}
              <TouchableOpacity
                style={styles.carrierButton}
                onPress={toggleDropdown}
              >
                <Text style={styles.carrierButtonText}>
                  {selectedCarrier || '통신사'}
                </Text>
                <Text style={styles.arrow}>
                  {isDropdownOpen ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>

              {/* 휴대폰 번호 입력 */}
              <TextInput
                value={phone}
                onChangeText={handlePhoneChange}
                placeholder="010-1234-5678"
                keyboardType="phone-pad"
                maxLength={13}
                style={styles.phoneInput}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleVerifyIdentity}
              />
            </View>

            {/* 통신사 드롭다운: 입력칸 바로 아래에 표시 */}
            {isDropdownOpen && (
              <View style={styles.dropdownInline}>
                {carriers.map((carrier) => (
                  <TouchableOpacity
                    key={carrier}
                    style={[
                      styles.dropdownItem,
                      selectedCarrier === carrier && styles.selectedItem
                    ]}
                    onPress={() => handleCarrierSelect(carrier)}
                  >
                    <Text style={[
                      styles.dropdownItemText,
                      selectedCarrier === carrier && styles.selectedItemText
                    ]}>
                      {carrier}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Animated.View>

          {/* 주민등록번호 표시 (아래로 슬라이드 + 드롭다운 오프셋) */}
          <Animated.View 
            style={[
              styles.fieldBlock,
              {
                transform: [
                  { translateY: residentIdFieldTranslateY },
                  { translateY: dropdownOffset }
                ],
              },
            ]}
          >
            <Text style={styles.label}>주민등록번호</Text>
            <TouchableOpacity 
              style={styles.residentIdContainer}
              onPress={() => {
                // 주민등록번호와 휴대폰 번호 초기화
                clearResidentId();
                clearPhone();
                // 로컬 상태도 초기화
                setPhone('010-');
                setSelectedCarrier('');
                router.push('/(auth)/(signup)/resident-id');
              }}
              activeOpacity={0.7}
            >
              <TextInput
                value={residentFront6 || ''}
                editable={false}
                style={[styles.residentIdInput, styles.disabledInput]}
                pointerEvents="none"
              />
              <Text style={styles.hyphen}>-</Text>
              <TextInput
                value={residentBack1 ? residentBack1 + '●●●●●●●' : ''}
                editable={false}
                style={[styles.residentIdInput, styles.disabledInput]}
                pointerEvents="none"
              />
            </TouchableOpacity>
          </Animated.View>

          {/* 이름 표시 (아래로 슬라이드 + 드롭다운 오프셋) */}
          <Animated.View 
            style={[
              styles.fieldBlock,
              {
                transform: [
                  { translateY: nameFieldTranslateY },
                  { translateY: dropdownOffset }
                ],
              },
            ]}
          >
            <Text style={styles.label}>이름</Text>
            <TouchableOpacity 
              style={styles.inputContainer}
              onPress={() => {
                // 이름, 주민등록번호, 휴대폰 번호 모두 초기화
                clearName();
                clearResidentId();
                clearPhone();
                // 로컬 상태도 초기화
                setPhone('010-');
                setSelectedCarrier('');
                router.push('/(auth)/(signup)/name');
              }}
              activeOpacity={0.7}
            >
              <TextInput
                value={name || ''}
                editable={false}
                style={[styles.input, styles.disabledInput]}
                pointerEvents="none"
              />
            </TouchableOpacity>
          </Animated.View>

          {/* 하단 고정 영역으로 버튼 이동 */}
          <View style={styles.spacer} />
          {isPhoneValid() && (
            <TouchableOpacity
              style={styles.verifyButton}
              onPress={handleVerifyIdentity}
            >
              <Text style={styles.verifyButtonText}>본인 인증 하기</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* 오버레이 (불투명한 회색) */}
      {showTermsModal && (
        <Animated.View 
          style={[
            styles.overlay,
            { opacity: overlayOpacity }
          ]}
        />
      )}

      {/* 약관 동의 모달 (위로 슬라이드) */}
      {showTermsModal && (
        <Animated.View 
          style={[
            styles.termsBlock,
            {
              opacity: termsBlockOpacity,
              transform: [{ translateY: termsBlockTranslateY }],
            },
          ]}
        >
          {/* 바텀시트 헤더 */}
          <View style={styles.bottomSheetHeader}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.termsContainer}>
            {/* 전체 동의 */}
            <TouchableOpacity style={styles.allAgreeContainer} onPress={handleAllAgree}>
              <View style={[styles.checkbox, allAgreed && styles.checkedBox]}>
                {allAgreed && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.allAgreeText}>전체 동의</Text>
            </TouchableOpacity>

            {/* 개별 약관들 */}
            <View style={styles.termsList}>
              <TouchableOpacity 
                style={styles.termItem} 
                onPress={() => handleTermAgree('service')}
              >
                <View style={[styles.checkbox, terms.service && styles.checkedBox]}>
                  {terms.service && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.termText}>[필수] Wallet Slot 서비스 이용약관</Text>
                <TouchableOpacity 
                  onPress={() => router.push('/(auth)/(signup)/terms-detail?type=service')}
                  style={styles.detailButton}
                >
                  <Text style={styles.arrow}>›</Text>
                </TouchableOpacity>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.termItem} 
                onPress={() => handleTermAgree('privacy')}
              >
                <View style={[styles.checkbox, terms.privacy && styles.checkedBox]}>
                  {terms.privacy && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.termText}>[필수] 개인(신용)정보 수집 및 이용</Text>
                <TouchableOpacity 
                  onPress={() => router.push('/(auth)/(signup)/terms-detail?type=privacy')}
                  style={styles.detailButton}
                >
                  <Text style={styles.arrow}>›</Text>
                </TouchableOpacity>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.termItem} 
                onPress={() => handleTermAgree('consignment')}
              >
                <View style={[styles.checkbox, terms.consignment && styles.checkedBox]}>
                  {terms.consignment && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.termText}>[필수] 개인정보 처리 위탁 - 알리고 (sms발송 대행)</Text>
                <TouchableOpacity 
                  onPress={() => router.push('/(auth)/(signup)/terms-detail?type=consignment')}
                  style={styles.detailButton}
                >
                  <Text style={styles.arrow}>›</Text>
                </TouchableOpacity>
              </TouchableOpacity>

              <View>
                <View style={styles.termItem}>
                  <TouchableOpacity 
                    style={styles.termItemContent}
                    onPress={() => handleTermAgree('openBanking')}
                  >
                    <View style={[styles.checkbox, terms.openBanking && styles.checkedBox]}>
                      {terms.openBanking && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.termText}>[필수] 오픈뱅킹 기본 동의</Text>
                    <TouchableOpacity 
                      onPress={toggleOpenBankingExpansion}
                      style={styles.expandButton}
                    >
                      <Text style={styles.expandArrow}>
                        {openBankingExpanded ? '▼' : '▶'}
                      </Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                </View>
                
                {openBankingExpanded && (
                  <View style={styles.subTermsContainer}>
                    <Text style={styles.subTermsDescription}>
                      Wallet Slot은 오픈뱅킹 대신 SSAFY 금융 API를 사용합니다.
                    </Text>
                    
                    <View style={styles.subTermItem}>
                      <TouchableOpacity 
                        style={styles.subTermItemContent}
                        onPress={() => handleOpenBankingSubTermAgree('service')}
                      >
                        <View style={[styles.checkbox, openBankingSubTerms.service && styles.checkedBox]}>
                          {openBankingSubTerms.service && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                        <Text style={styles.subTermText}>[필수] 오픈뱅킹 서비스 이용약관</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => router.push('/(auth)/(signup)/terms-detail?type=openBankingService')}
                        style={styles.detailButton}
                      >
                        <Text style={styles.arrow}>›</Text>
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.subTermItem}>
                      <TouchableOpacity 
                        style={styles.subTermItemContent}
                        onPress={() => handleOpenBankingSubTermAgree('privacy')}
                      >
                        <View style={[styles.checkbox, openBankingSubTerms.privacy && styles.checkedBox]}>
                          {openBankingSubTerms.privacy && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                        <Text style={styles.subTermText}>[필수] 개인정보 수집·이용(오픈뱅킹)</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => router.push('/(auth)/(signup)/terms-detail?type=openBankingPrivacy')}
                        style={styles.detailButton}
                      >
                        <Text style={styles.arrow}>›</Text>
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.subTermItem}>
                      <TouchableOpacity 
                        style={styles.subTermItemContent}
                        onPress={() => handleOpenBankingSubTermAgree('thirdParty')}
                      >
                        <View style={[styles.checkbox, openBankingSubTerms.thirdParty && styles.checkedBox]}>
                          {openBankingSubTerms.thirdParty && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                        <Text style={styles.subTermText}>개인정보 제3자 제공(오픈뱅킹)</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => router.push('/(auth)/(signup)/terms-detail?type=openBankingThirdParty')}
                        style={styles.detailButton}
                      >
                        <Text style={styles.arrow}>›</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>

          {/* 확인 버튼 */}
          <TouchableOpacity 
            style={[
              styles.confirmButton, 
              (!terms.service || !terms.privacy || !terms.consignment || !terms.openBanking) && styles.disabledButton
            ]} 
            onPress={handleConfirm}
            disabled={!terms.service || !terms.privacy || !terms.consignment || !terms.openBanking}
          >
            <Text style={[
              styles.confirmButtonText,
              (!terms.service || !terms.privacy || !terms.consignment || !terms.openBanking) && styles.disabledButtonText
            ]}>
              확인
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },//버그 테두리
  debugRed: {borderWidth: 1, borderColor: 'red'},
  flex: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 64,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 32,
    color: '#111827',
  },
  fieldBlock: {
    marginTop: 8,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  carrierButton: {
    height: 44,
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 80,
  },
  carrierButtonText: {
    fontSize: 16,
    color: '#111827',
  },
  arrow: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
  },
  phoneInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  // 인라인 드롭다운: 입력칸 바로 아래에 자연스럽게 렌더링
  dropdownInline: {
    marginTop: 3,
    width: 80,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 8,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    minHeight: 36,
  },
  selectedItem: {
    backgroundColor: '#EBF8FF',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#111827',
    textAlign: 'center',
  },
  selectedItemText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  inputContainer: {
    // TouchableOpacity를 위한 컨테이너
  },
  disabledInput: {
    backgroundColor: '#F9FAFB',
    color: '#6B7280',
  },
  verifyButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // 화면의 아래쪽 공간 확보용 스페이서 (버튼 위 여백)
  spacer: {
    flexGrow: 1,
  },
  residentIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  residentIdInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    textAlign: 'center',
    minWidth: 0,
  },
  hyphen: {
    fontSize: 16,
    marginHorizontal: 8,
    color: '#111827',
  },
  // 오버레이 (불투명한 회색)
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  // 약관 동의 모달 (바텀시트)
  termsBlock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    minHeight: '50%',
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#6B7280',
  },
  // 약관 컨테이너
  termsContainer: {
    paddingHorizontal: 20,
  },
  allAgreeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  allAgreeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 12,
  },
  // 약관 리스트
  termsList: {
    paddingVertical: 8,
  },
  termItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  // 체크박스
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // 약관 텍스트
  termText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
  },
  // 상세보기 버튼
  detailButton: {
    padding: 8,
    marginLeft: 8,
  },
  // 오픈뱅킹 확장 관련 스타일
  termItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  expandButton: {
    padding: 8,
    marginLeft: 8,
  },
  expandArrow: {
    fontSize: 12,
    color: '#6B7280',
  },
  subTermsContainer: {
    paddingLeft: 32,
    paddingBottom: 16,
    backgroundColor: '#F9FAFB',
  },
  subTermsDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  subTermItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  subTermItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subTermText: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    marginLeft: 12,
  },
  // 확인 버튼
  confirmButton: {
    backgroundColor: '#3B82F6',
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#E5E7EB',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButtonText: {
    color: '#9CA3AF',
  },
});
