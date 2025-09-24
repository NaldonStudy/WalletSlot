import { ThemedText } from '@/components/ThemedText';
import { BANK_CODES } from '@/src/constants/banks';
import { useBankSelectionStore } from '@/src/store/bankSelectionStore';
import { useLocalUserStore } from '@/src/store/localUserStore';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';

const SELECT_BLUE = '#2383BD';

export default function AccountConnectScreen() {
  const router = useRouter();
  const { user } = useLocalUserStore();
  const displayName = user?.userName || '사용자';
  const banks = useBankSelectionStore(s => s.selectedBanks);
  const data = banks || [];

  // 0% → 100% 로딩 (약 4초)
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (progress >= 100) return;
    const id = setInterval(() => {
      setProgress((p) => Math.min(100, p + 1));
    }, 40); // 100 * 40ms = 4000ms
    return () => clearInterval(id);
  }, [progress]);

  const isLoading = progress < 100;

  // 하단 큰 스피너 애니메이션 (조금 느림)
  const spinAnimSlow = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (isLoading) {
      const slowLoop = Animated.loop(
        Animated.timing(spinAnimSlow, {
          toValue: 1,
          duration: 1800,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      spinAnimSlow.setValue(0);
      slowLoop.start();
      return () => slowLoop.stop();
    }
  }, [isLoading, spinAnimSlow]);
  const rotateSlow = spinAnimSlow.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  // 선택 단계 관리
  type Phase = 'multi' | 'representative';
  const [phase, setPhase] = useState<Phase>('multi');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [repId, setRepId] = useState<string | null>(null);

  const toggleSelect = (id: string) => {
    if (phase === 'multi') {
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
    } else {
      setRepId(id);
    }
  };

  const allSelected = phase === 'multi' && selectedIds.size === data.length && data.length > 0;
  const toggleSelectAll = () => {
    if (phase !== 'multi') return;
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.map((_, idx) => `${idx}`)));
    }
  };

  const filteredData = phase === 'multi' ? data : data.filter((_, idx) => selectedIds.has(`${idx}`));

  const renderItem = ({ item, index }: { item: { bankCode: string; bankName: string }; index: number }) => {
    const id = `${index}`;
    const bank = BANK_CODES[item.bankCode as keyof typeof BANK_CODES];
    const color = bank?.color || '#E5E7EB';
    const selected = phase === 'multi' ? selectedIds.has(id) : repId === id;
    return (
      <TouchableOpacity onPress={() => toggleSelect(id)} activeOpacity={0.9}>
        <View style={[styles.card, { borderColor: color, shadowColor: color }]}> 
          <View>
            <ThemedText style={styles.bankName}>{item.bankName}</ThemedText>
            <ThemedText style={styles.accountId}>302-*****</ThemedText>
          </View>
          {isLoading ? (
            <Image
              source={require('@/src/assets/images/loading/loop.png')}
              style={styles.inlineSpinner}
              resizeMode="contain"
            />
          ) : selected ? (
            <View style={styles.checkBadge}><ThemedText style={styles.checkBadgeText}>✓</ThemedText></View>
          ) : (
            <View style={[styles.selectDot, { backgroundColor: 'transparent', borderColor: '#C7CED9' }]} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const onConfirm = () => {
    if (phase === 'multi') {
      if (selectedIds.size === 0) return;
      setPhase('representative');
      setRepId(null);
    } else {
      // 대표 계좌 확정 후 분류 화면으로 이동
      router.push('/(mydata)/classifySlots' as any);
    }
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <>
          <ThemedText style={styles.title}>{displayName}님의 계좌를 불러오고 있어요.</ThemedText>
          <FlatList
            data={data}
            keyExtractor={(_, idx) => `${idx}`}
            contentContainerStyle={[styles.list, styles.listWhileLoading]}
            renderItem={renderItem}
          />
          <View style={styles.loadingFooter}>
            <ThemedText style={styles.progressText}>{progress}%</ThemedText>
            <Animated.Image source={require('@/src/assets/images/loading/spinner.png')} style={[styles.spinner, { transform: [{ rotate: rotateSlow }] }]} resizeMode="contain" />
          </View>
        </>
      ) : (
        <>
          {/* 상단 뒤로가기 */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ThemedText style={styles.backIcon}>{'<'}</ThemedText>
          </TouchableOpacity>

          <ThemedText style={styles.title}>{displayName}님의 계좌가 연결되었습니다</ThemedText>
          <ThemedText style={styles.subtitle}>{phase === 'multi' ? '서비스에 사용할 계좌를 선택해주세요' : '대표로 사용할 계좌를 선택해주세요'}</ThemedText>

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

          <FlatList
            data={filteredData}
            keyExtractor={(_, idx) => `${idx}`}
            contentContainerStyle={styles.list}
            renderItem={renderItem}
          />

          {/* 대표 계좌 Preview */}
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
                  <ThemedText style={styles.repAccount}>302-*****</ThemedText>
                  <ThemedText style={styles.repAmount}>570,000 원</ThemedText>
                </View>
              </LinearGradient>
            </View>
          )}

          {/* 하단 선택 버튼 */}
          <TouchableOpacity
            style={[styles.confirmBtn,
              (phase === 'multi' ? selectedIds.size > 0 : !!repId) ? styles.confirmEnabled : styles.confirmDisabled,
            ]}
            disabled={phase === 'multi' ? selectedIds.size === 0 : !repId}
            onPress={onConfirm}
          >
            <ThemedText style={[styles.confirmText,
              (phase === 'multi' ? selectedIds.size === 0 : !repId) && styles.confirmTextDisabled]}
            >{phase === 'multi' ? '선택' : '확인'}</ThemedText>
          </TouchableOpacity>
        </>
      )}
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bankName: { fontSize: 16, fontWeight: '700', color: '#111' },
  accountId: { fontSize: 14, color: '#374151', marginTop: 4 },
  selectAllRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, marginTop: 8 },
  selectDot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2 },
  loadingFooter: { alignItems: 'center', paddingVertical: 28 },
  progressText: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 10 },
  spinner: { width: 80, height: 80 },
  inlineSpinner: { width: 22, height: 22 },
  checkBadge: { width: 22, height: 22, borderRadius: 11, backgroundColor: SELECT_BLUE, alignItems: 'center', justifyContent: 'center', shadowColor: SELECT_BLUE, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  checkBadgeText: { color: '#fff', fontWeight: '700', lineHeight: 22 },
  confirmBtn: { marginTop: 12, borderRadius: 10, alignItems: 'center', paddingVertical: 16 },
  confirmEnabled: { backgroundColor: SELECT_BLUE },
  confirmDisabled: { backgroundColor: '#E5E7EB' },
  confirmText: { color: '#fff', fontWeight: '700' },
  confirmTextDisabled: { color: '#9AA0A6' },
  // 대표카드
  representativeWrapper: {
    marginTop: 16,
    borderRadius: 12,
    // 그림자/입체감은 래퍼에 줘야 Android에서도 잘 보입니다.
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
});
