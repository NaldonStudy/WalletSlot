import { SimpleLoadingIndicator } from '@/src/components';
import { BANK_CODES } from '@/src/constants/banks';
import { Spacing, themes, Typography } from '@/src/constants/theme';
import { UserAccount } from '@/src/types';
import { format } from '@/src/utils';
import { Image } from 'expo-image';
import React, { memo, useState } from 'react';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';

type AccountSummaryProps = {
    account: UserAccount;
}

export const AccountSummary = memo(({ account }: AccountSummaryProps) => {
    // 서버의 bankCode로 은행 정보 찾기
    const bankInfo = BANK_CODES[account.bankId as keyof typeof BANK_CODES];
    const [imageLoaded, setImageLoaded] = useState(false);

    const colorScheme = useColorScheme() ?? 'light';
    const theme = themes[colorScheme];
    const textColor = { color: theme.colors.text.primary };

    // 계좌가 변경될 때마다 이미지 로딩 상태 리셋
    React.useEffect(() => {
        setImageLoaded(false);
    }, [account.bankId]);

    // bankInfo가 없으면 기본값 사용
    if (!bankInfo) {
        console.warn('[AccountSummary] 은행 정보를 찾을 수 없습니다:', account.bankId);
        return null; // 또는 기본 UI 반환
    }

    const balanceNumber = Number(account.accountBalance ?? 0);

    return (
        <View style={[styles.card, theme.shadows.base,{ 
            backgroundColor: theme.colors.background.primary,
            borderColor: theme.colors.border.light,
         }]}>
            <View style={styles.topContent}>
                {/* 상단: 은행 로고 + 은행명 + 계좌번호*/}
                <View style={styles.row}>
                    <View style={styles.logoWrapper}>
                        {!imageLoaded && (
                            <SimpleLoadingIndicator 
                                size="small" 
                                color={theme.colors.text.secondary}
                                testID="account-logo-loading"
                            />
                        )}
                        <Image 
                            source={bankInfo.logo} 
                            style={[styles.logo, { opacity: imageLoaded ? 1 : 0 }]}
                            contentFit="contain"
                            transition={100}
                            onLoad={() => setImageLoaded(true)}
                            cachePolicy="memory-disk"
                            priority="high"
                        />
                    </View>
                    <Text style={[styles.bankName, { color: textColor.color }]}>{bankInfo.name}</Text>
                    <Text style={[styles.accountNumber, { color: textColor.color }]}>{account.accountNo}</Text>
                </View>
            </View>
            {/* 잔액 */}
            <Text style={[styles.balance, { color: textColor.color }]}>{format.currency(balanceNumber)}</Text>
        </View>
    )
}, (prevProps, nextProps) => {
    // 계좌 정보가 같으면 리렌더링하지 않음
    return prevProps.account.bankId === nextProps.account.bankId &&
        prevProps.account.alias === nextProps.account.alias &&
        prevProps.account.accountNo === nextProps.account.accountNo &&
        String(prevProps.account.accountBalance ?? '') === String(nextProps.account.accountBalance ?? '');
});

AccountSummary.displayName = 'AccountSummary';

const styles = StyleSheet.create({
    card: {
        borderRadius: Spacing.sm,
        padding: Spacing.base,
        marginBottom: Spacing.sm,
        marginHorizontal: Spacing.sm,
        elevation: 3,
        height: 100,
        justifyContent: 'space-between', // 세로 공간 분배
    },
    topContent: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    logoWrapper: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(255,255,255,0.8)', // 흰색 배경
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.sm,
        position: 'relative',
    },
    loadingIndicator: {
        position: 'absolute',
    },
    logo: {
        width: Spacing.lg,
        height: Spacing.lg,
        resizeMode: 'contain',
    },
    bankName: {
        fontSize: Typography.fontSize.lg,
        fontWeight: Typography.fontWeight.bold,
    },
    accountNumber: {
        marginLeft: Spacing.sm,
        fontSize: Typography.fontSize.lg,
        textDecorationLine: 'underline',
    },
    balance: {
        fontSize: Typography.fontSize['2xl'],
        fontWeight: Typography.fontWeight.bold,
        alignSelf: 'flex-end',
    },
});