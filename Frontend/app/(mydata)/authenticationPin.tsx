import { mydataApi } from '@/src/api/mydata';
import { AuthKeypad, PinDots } from '@/src/components';
import { useAccountsStore } from '@/src/store/accountsStore';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AuthenticationPinScreen() {
  const params = useLocalSearchParams();
  const banksParam = (params?.banks as string) || undefined;

  const [pin, setPin] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const setAccounts = useAccountsStore(s => s.setAccounts);

  useEffect(() => {
    if (pin.length === 6 && !submitting) {
      setSubmitting(true);
      const run = async () => {
        try {
          const accounts = await mydataApi.fetchAccounts();
          if (Array.isArray(accounts)) setAccounts(accounts);
        } catch (e) {
          console.warn('[MYDATA] 계좌 연동(fetch) 실패', e);
        } finally {
          router.push({ pathname: '/(mydata)/account-connect', params: { banks: banksParam || '' } } as any);
          setSubmitting(false);
        }
      };
      run();
    }
  }, [pin, submitting]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>{'<'} 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>인증서</Text>
        <View style={styles.headerRight} />
      </View>
      <View style={styles.body}>
        <Text style={styles.subtitle}>PIN 6자리를 입력해주세요</Text>
        <PinDots length={6} filled={pin.length} size="md" />
        <AuthKeypad
          onDigitPress={(d) => {
            if (pin.length < 6 && !submitting) setPin(prev => prev + d);
          }}
          onBackspace={() => !submitting && setPin(prev => prev.slice(0, -1))}
          onClear={() => !submitting && setPin('')}
          fakeTouch
          animation
          size="medium"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { height: 56, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  backBtn: { position: 'absolute', left: 16, padding: 8 },
  backText: { color: '#6B7280' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  headerRight: { position: 'absolute', right: 16, width: 32 },
  body: { flex: 1, paddingHorizontal: 24, paddingTop: 24, alignItems: 'center' },
  subtitle: { fontSize: 14, color: '#6B7280', marginBottom: 16 },
  pinDots: { },
  dot: { },
  dotEmpty: { },
  dotFilled: { },
});
