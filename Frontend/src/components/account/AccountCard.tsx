import { BANK_CODES } from '@/src/constants/banks';
import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Spacing, Typography } from '@/src/constants/theme';
import { format } from '@/src/utils';

export type AccountCardData = {
    bankCode: keyof typeof BANK_CODES;
    accountName: string;
    accountNumber: string;
    balance: number;
};

// 배경색의 밝기에 따라 글자색 결정하는 함수
const getTextColor = (backgroundColor: string): string => {
    // hex 색상을 RGB로 변환
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // 밝기 계산 (0-255)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // 밝기가 128보다 작으면 어두운 배경이므로 흰색, 아니면 검은색
    return brightness < 128 ? '#FFFFFF' : '#000000';
};

type AccountCardProps = AccountCardData & {
    style?: StyleProp<ViewStyle>;
}

const AccountCard: React.FC<AccountCardProps> = ({
    bankCode,
    accountName,
    accountNumber,
    balance,
    style,
}) => {
    const bankInfo = BANK_CODES[bankCode];
    const textColor = getTextColor(bankInfo.color);
    const balanceFormatted = format.currency(balance);

    return (
        <View style={[styles.card, { backgroundColor: bankInfo.color }, style]}>
            <View style={styles.topContent}>
                {/* 상단: 은행 로고 + 은행명 */}
                <View style={styles.row}>
                    <View style={styles.logoWrapper}>
                        <Image 
                            source={bankInfo.logo} 
                            style={styles.logo}
                            contentFit="contain"
                            transition={200}
                        />
                    </View>
                    <Text style={[styles.bankName, { color: textColor }]}>{bankInfo.name}</Text>
                </View>

                {/* 계좌명 */}
                <Text style={[styles.accountName, { color: textColor }]}>{accountName}</Text>
                {/* 계좌번호 */}
                <Text style={[styles.accountNumber, { color: textColor }]}>{accountNumber}</Text>
            </View>

            {/* 하단 : 잔액 */}
            <Text style={[styles.balance, { color: textColor }]}>{balanceFormatted}</Text>
        </View>
    )
}

export default AccountCard;

const styles = StyleSheet.create({
    card: {
        borderRadius: Spacing.sm,
        padding: Spacing.base,
        marginBottom: Spacing.sm,
        marginHorizontal: Spacing.sm,
        elevation: 3,
        height: 180,
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
        width: Spacing.lg,
        height: Spacing.lg,
        borderRadius: 15,
        backgroundColor: 'rgba(255,255,255,0.8)', // 흰색 배경
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.sm,
    },
    logo: {
        width: 28,
        height: 28,
        resizeMode: 'contain',
    },
    bankName: {
        fontSize: Typography.fontSize.lg,
        fontWeight: Typography.fontWeight.bold,
    },
    accountName: {
        marginTop: Spacing.lg,
        marginLeft: Spacing.sm,
        fontSize: Typography.fontSize.lg,
        fontWeight: Typography.fontWeight.bold,
    },
    accountNumber: {
        marginTop: Spacing.sm,
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