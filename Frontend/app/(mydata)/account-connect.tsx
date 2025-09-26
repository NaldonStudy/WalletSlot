// screens/AccountConnectScreen.tsx
import { ThemedText } from '@/components/ThemedText';
import { accountApi } from '@/src/api';
import { BANK_CODES } from '@/src/constants/banks';
import { useAccountsStore } from '@/src/store/accountsStore';
import { useBankSelectionStore } from '@/src/store/bankSelectionStore';
import { useLocalUserStore } from '@/src/store/localUserStore';
import type { UserAccount } from '@/src/types';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';

const SELECT_BLUE = '#2383BD';

export default function AccountConnectScreen() {
  const params = useLocalSearchParams();
  const navStatus = (params?.status as string) || undefined;
  const navError = (params?.message as string) || null;
  const { user } = useLocalUserStore();
  const displayName = user?.userName || '사용자';

  // ========================================
  // 1. 데이터 관리 (상태, 스토어)
  // ========================================
  const { accounts, setAccounts } = useAccountsStore();
  const selectedBanks = useBankSelectionStore(s => s.selectedBanks);

  // API 상태
  const [apiError, setApiError] = useState<string | null>(null);
  const [allAccounts, setAllAccounts] = useState<UserAccount[]>(accounts || []);
  const [isApiCompleted, setIsApiCompleted] = useState<boolean>(!!(accounts && accounts.length > 0));

  // 선택 단계 관리
  type Phase = 'multi' | 'representative';
  const [phase, setPhase] = useState<Phase>('multi');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [repId, setRepId] = useState<string | null>(null);

  // 대표 계좌 관련
  const [repBalance, setRepBalance] = useState<number | null>(null);
  const [isSettingPrimary, setIsSettingPrimary] = useState(false);

  // 계좌 연동 관련
  const [isLinkingAccounts, setIsLinkingAccounts] = useState(false);
  const [isAccountsLinked, setIsAccountsLinked] = useState(false);

  // ========================================
  // 2. API 호출 및 데이터 처리
  // ========================================


  // 외부(동의 화면)에서 조회한 결과를 사용
  useEffect(() => {
    if (navStatus === 'error' && navError) {
      setApiError(navError);
      setIsApiCompleted(false);
    } else if (accounts && accounts.length > 0) {
      setAllAccounts(accounts);
      setApiError(null);
      setIsApiCompleted(true);
    } else {
      // 계정이 비어있고 오류도 없는 경우: 아직 동의 화면에서 조회 전이거나 빈 결과
      setApiError(null);
      setIsApiCompleted(true);
    }
  }, [navStatus, navError, accounts]);

  useEffect(() => {
    console.log('[MYDATA][AC-UE1] mount (no fetch)');
    return () => console.log('[MYDATA][AC-UE1] unmount cleanup');
  }, []);

  // 동의 화면에서 이미 필터링된 계좌들 (추가 필터링 불필요)
  const filteredAccounts = useMemo(() => {
    if (!isApiCompleted) return [];
    return allAccounts; // 백엔드에서 이미 선택된 은행의 계좌만 반환
  }, [isApiCompleted, allAccounts]);

  // ========================================
  // 3. UI 상태 및 애니메이션 (로딩/스피너 제거)
  // ========================================

  // 콘텐츠 페이드 인 애니메이션 (진입 시 1회)
  const contentOpacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    console.log('[MYDATA][AC-UE2] fade-in start');
    contentOpacity.setValue(0);
    Animated.timing(contentOpacity, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
    return () => console.log('[MYDATA][AC-UE2] fade-in cleanup');
  }, [contentOpacity]);

  // ========================================
  // 4. 비즈니스 로직 함수들
  // ========================================
  
  // 대표 계좌 설정
  const setPrimaryAccount = async (accountId: string) => {
    if (isSettingPrimary) return;
    setIsSettingPrimary(true);
    try {
      const requestData = { isPrimary: true };
      console.log('[Account Connect] 대표 계좌 설정 요청:', accountId, requestData);

      const response = await accountApi.setMainAccount(accountId, requestData);
      console.log('[Account Connect] 대표 계좌 설정 성공:', response);

      if (response.success) {
        router.push('/(mydata)/classifySlots' as any);
      } else {
        throw new Error(response.message || '대표 계좌 설정에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('[Account Connect] 대표 계좌 설정 실패:', error);
    } finally {
      setIsSettingPrimary(false);
    }
  };

  // 계좌 연동
  const linkSelectedAccounts = async () => {
    if (isLinkingAccounts) return;
    setIsLinkingAccounts(true);
    try {
      const selectedIndexList = Array.from(selectedIds);
      const selectedAccounts = selectedIndexList
        .map(id => filteredAccounts[Number(id)])
        .filter(Boolean);

      const accountIds = selectedAccounts
        .map(acc => acc.accountId)
        .filter((v): v is string => typeof v === 'string' && v.length > 0);

      const requestData = { accountIds };
      console.log('[Account Connect] 계좌 연동 요청:', requestData);

      const response = await accountApi.linkAccounts(requestData);
      console.log('[Account Connect] 계좌 연동 성공:', response);

      if (response.success) {
        // 연동된 계좌들만 저장 (다음 화면에서 표시할 용도). 서버가 목록을 반환하지 않으므로 선택된 계좌로 구성
        setAccounts(selectedAccounts);
        setIsAccountsLinked(true);
        setPhase('representative');
        setRepId(null);
      } else {
        throw new Error(response.message || '계좌 연동에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('[Account Connect] 계좌 연동 실패:', error);
    } finally {
      setIsLinkingAccounts(false);
    }
  };


  // ========================================
  // 5. UI 이벤트 핸들러들
  // ========================================
  
  const toggleSelect = (id: string) => {
    if (phase === 'multi') {
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
    } else {
      setRepId(id);
      const selectedAccount = filteredData[Number(id)];
      if (selectedAccount && selectedAccount.accountId) {
        // 연동된 계좌 데이터에서 잔액 가져오기 (API 호출 대신)
        setRepBalance(Number(selectedAccount.accountBalance || '0'));
      }
    }
  };

  const toggleSelectAll = () => {
    if (phase !== 'multi') return;
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredAccounts.map((_, idx) => `${idx}`)));
  };

  const onConfirm = () => {
    if (phase === 'multi') {
      if (selectedIds.size === 0) return;
      if (isAccountsLinked) {
        setPhase('representative');
        setRepId(null);
      } else {
        linkSelectedAccounts();
      }
    } else {
      if (repId !== null) {
        const selectedAccount = filteredData[Number(repId)];
        if (selectedAccount && selectedAccount.accountId) {
          setPrimaryAccount(selectedAccount.accountId);
        }
      }
    }
  };

  // ========================================
  // 6. 계산된 값들 (useMemo)
  // ========================================
  
  const allSelected = useMemo(
    () => phase === 'multi' && selectedIds.size === filteredAccounts.length && filteredAccounts.length > 0,
    [phase, selectedIds.size, filteredAccounts.length]
  );

  const filteredData = useMemo(() => {
    if (phase === 'multi') {
      // 1단계: 모든 계좌 표시 (선택용)
      return filteredAccounts;
    } else {
      // 2단계: 연동된 계좌들만 표시 (대표 계좌 선택용)
      return accounts; // 연동된 계좌들만 표시
    }
  }, [phase, filteredAccounts, accounts]);

  const hasAccountsForSelectedBanks = filteredAccounts.length > 0;

  // ========================================
  // 7. 사이드 이펙트 (useEffect)
  // ========================================
  
  // 대표 선택 변경 시 잔액 초기화
  useEffect(() => {
    if (repId === null) setRepBalance(null);
  }, [repId]);

  // 로깅(개발용) - 완료 시에만 실행
  useEffect(() => {
    console.log('[MYDATA][AC-UE3] isApiCompleted:', isApiCompleted,
      '| banks:', selectedBanks.length,
      '| accounts:', allAccounts.length,
      '| filtered:', filteredAccounts.length);
  }, [isApiCompleted]);

  // ========================================
  // 8. 렌더링 함수들
  // ========================================
  
  const renderItem = ({ item, index }: { item: UserAccount; index: number }) => {
    const id = `${index}`;
    const bank = BANK_CODES[item.bankId as keyof typeof BANK_CODES];
    const color = bank?.color || '#E5E7EB';
    const selected = phase === 'multi' ? selectedIds.has(id) : repId === id;

    const formatAccountNumber = (accountNo: string) => {
      const cleaned = (accountNo || '').replace(/\D/g, '');
      if (cleaned.length === 0) return '***-****';
      const head = cleaned.slice(0, 3);
      if (cleaned.length <= 3) return head;
      if (cleaned.length <= 7) {
        const midLen = cleaned.length - 3;
        return `${head}-${'*'.repeat(midLen)}`;
      }
      const tail = cleaned.slice(-4);
      const midLen = cleaned.length - 7; // head 3 + tail 4 제외
      return `${head}-${'*'.repeat(midLen)}-${tail}`;
    };

    return (
      <TouchableOpacity onPress={() => toggleSelect(id)} activeOpacity={0.9}>
        <View style={[styles.card, { borderColor: color, shadowColor: color }]}>
          <View>
            <View style={styles.bankRow}>
              {!!bank?.logo && (
                <Image source={bank.logo} style={styles.bankLogo} resizeMode="contain" />
              )}
              <ThemedText style={styles.bankName}>{item.bankName}</ThemedText>
            </View>
            <ThemedText style={styles.accountId}>
              {formatAccountNumber(item.accountNo)}
            </ThemedText>
            {phase !== 'multi' && item.accountBalance != null && (
              <ThemedText style={styles.accountBalance}>
                {Number(item.accountBalance ?? '0').toLocaleString()}원
              </ThemedText>
            )}
          </View>
          {selected ? (
            <View style={styles.checkBadge}>
              <ThemedText style={styles.checkBadgeText}>✓</ThemedText>
            </View>
          ) : (
            <View style={[styles.selectDot, { backgroundColor: 'transparent', borderColor: '#C7CED9' }]} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // ========================================
  // 9. 메인 렌더링 (화면 순서대로)
  // ========================================

  return (
    <View style={styles.container}>
      {/* 1. 에러 화면 (API 실패 시) */}
      {(apiError ? (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorTitle}>계좌 정보를 불러올 수 없습니다</ThemedText>
            <ThemedText style={styles.errorMessage}>{apiError}</ThemedText>
            <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
              <ThemedText style={styles.retryButtonText}>뒤로 가기</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          /* 계좌 선택 화면 + 대표 계좌 선택 화면 */
          <Animated.View style={{ flex: 1, opacity: contentOpacity }}>
            {/* 상단 뒤로가기 */}
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ThemedText style={styles.backIcon}>{'<'}</ThemedText>
            </TouchableOpacity>

            <ThemedText style={styles.title}>{displayName}님의 계좌가 연결되었습니다</ThemedText>
            <ThemedText style={styles.subtitle}>
              {phase === 'multi' ? '서비스에 사용할 계좌를 선택해주세요' : '대표로 사용할 계좌를 선택해주세요'}
            </ThemedText>

            {/* 모두 선택 (멀티 단계에서만) */}
            {phase === 'multi' && (
              <TouchableOpacity onPress={toggleSelectAll} style={styles.selectAllRow}>
                {allSelected ? (
                  <View style={styles.checkBadge}><ThemedText style={styles.checkBadgeText}>✓</ThemedText></View>
                ) : (
                  <View style={[styles.selectDot, { backgroundColor: 'transparent', borderColor: '#C7CED9' }]} />
                )}
                <ThemedText>모두 선택</ThemedText>
              </TouchableOpacity>
            )}

            {/* 계좌 목록 또는 계좌 없음 메시지 */}
            {!hasAccountsForSelectedBanks ? (
              <View style={styles.noAccountsContainer}>
                <ThemedText style={styles.noAccountsText}>
                  저런! 선택하신 은행에 고객님의 계좌가 없어요!{'\n'}다시 선택해주세요
                </ThemedText>
              </View>
            ) : (
              <FlatList
                data={filteredData}
                keyExtractor={(item) => item.accountId ?? `${item.bankId}-${item.accountNo}`}
                contentContainerStyle={styles.list}
                renderItem={renderItem}
              />
            )}

            {/* 대표 계좌 Preview (대표 계좌 선택 단계에서만) */}
            {phase === 'representative' && repId !== null && (
              <View style={styles.representativeWrapper}>
                <LinearGradient
                  colors={['#BFF098', '#6FD6FF']}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={styles.representativeCard}
                >
                  <ThemedText style={styles.repBankName}>{filteredData[Number(repId)]?.bankName}</ThemedText>
                  <View style={styles.repRow}>
                    <ThemedText style={styles.repAccount}>
                      {(() => {
                        const account = filteredData[Number(repId)];
                        if (account && account.accountNo) {
                          return `302-****-${account.accountNo.replace(/\D/g, '').slice(-4)}`;
                        }
                        return '302-*****';
                      })()}
                    </ThemedText>
                    <ThemedText style={styles.repAmount}>
                      {repBalance !== null
                        ? `${repBalance.toLocaleString()}원`
                        : (() => {
                            const account = filteredData[Number(repId)];
                            if (account && account.accountBalance != null) {
                              return `${Number(account.accountBalance).toLocaleString()}원`;
                            }
                            return '0원';
                          })()}
                    </ThemedText>
                  </View>
                </LinearGradient>
              </View>
            )}

            {/* 하단 확인 버튼 */}
            <TouchableOpacity
              style={[
                styles.confirmBtn,
                (phase === 'multi' ? selectedIds.size > 0 : !!repId) ? styles.confirmEnabled : styles.confirmDisabled,
              ]}
              disabled={phase === 'multi' ? selectedIds.size === 0 : !repId || isLinkingAccounts || isSettingPrimary}
              onPress={onConfirm}
            >
              <ThemedText
                style={[
                  styles.confirmText,
                  (phase === 'multi' ? selectedIds.size === 0 : !repId) && styles.confirmTextDisabled,
                ]}
              >
                {isLinkingAccounts
                  ? '연동 중...'
                  : isSettingPrimary
                  ? '설정 중...'
                  : phase === 'multi'
                  ? isAccountsLinked
                    ? '대표 계좌 선택'
                    : '연동하기'
                  : '확인'}
              </ThemedText>
            </TouchableOpacity>
          </Animated.View>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 20 },
  backBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  backIcon: { fontSize: 20, color: '#111' },
  title: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginTop: 8, color: '#111' },
  subtitle: { fontSize: 12, textAlign: 'center', color: '#6B7280', marginTop: 8, marginBottom: 16 },
  list: { gap: 12, paddingTop: 16 },
  listWhileLoading: { paddingTop: 56 },
  card: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bankRow: { flexDirection: 'row', alignItems: 'center' },
  bankLogo: { width: 28, height: 28, marginRight: 10 },
  bankName: { fontSize: 16, fontWeight: '700', color: '#111' },
  accountId: { fontSize: 14, color: '#374151', marginTop: 4 },
  selectAllRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, marginTop: 8 },
  selectDot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2 },
  loadingFooter: { alignItems: 'center', paddingVertical: 28 },
  progressText: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 10 },
  spinner: { width: 80, height: 80 },
  inlineSpinner: { width: 22, height: 22 },
  checkBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: SELECT_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: SELECT_BLUE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  checkBadgeText: { color: '#fff', fontWeight: '700', lineHeight: 22 },
  confirmBtn: { marginTop: 12, borderRadius: 10, alignItems: 'center', paddingVertical: 16 },
  confirmEnabled: { backgroundColor: SELECT_BLUE },
  confirmDisabled: { backgroundColor: '#E5E7EB' },
  confirmText: { color: '#fff', fontWeight: '700' },
  confirmTextDisabled: { color: '#9AA0A6' },
  representativeWrapper: {
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 14,
  },
  representativeCard: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 72,
    overflow: 'hidden',
  },
  repBankName: { fontSize: 16, fontWeight: '700', color: '#111' },
  repRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  repAccount: { fontSize: 14, color: '#374151' },
  repAmount: { fontSize: 18, fontWeight: '700', color: '#111' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  errorTitle: { fontSize: 20, fontWeight: '700', color: '#111', textAlign: 'center', marginBottom: 16 },
  errorMessage: { fontSize: 16, color: '#6B7280', textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  retryButton: { backgroundColor: '#2383BD', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 10 },
  retryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  accountBalance: { fontSize: 14, color: '#10B981', marginTop: 4, fontWeight: '600' },
  noAccountsContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, paddingVertical: 48 },
  noAccountsText: { fontSize: 16, fontWeight: '500', color: '#6B7280', textAlign: 'center', lineHeight: 24 },
});
