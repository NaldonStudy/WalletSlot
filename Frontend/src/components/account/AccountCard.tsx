import { BANK_CODES } from '@/src/constants/banks';
import { Spacing, Typography } from '@/src/constants/theme';
import { format } from '@/src/utils';
import { Image } from 'expo-image';
import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle, TouchableOpacity } from 'react-native';
import RepresentativeIcon from '@/src/assets/icons/common/representative.svg';

export type AccountCardData = {
    bankId: string; // 서버에서 오는 bankId (UUID)
    accountName: string;
    accountNumber: string;
    balance: number;
    isPrimary?: boolean; // 대표 계좌 여부
};

// 배경색의 밝기에 따라 글자색 결정하는 함수
const getTextColor = (backgroundColor: string): string => {
    try {
        // hex 색상을 정리하고 RGB로 변환
        const hex = backgroundColor.replace('#', '').trim();
        
        // hex 색상이 유효한지 확인
        if (hex.length !== 6 || !/^[0-9A-Fa-f]{6}$/.test(hex)) {
            console.warn('[AccountCard] 유효하지 않은 색상:', backgroundColor);
            return '#000000'; // 기본값
        }
        
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        // 밝기 계산 (0-255)
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;

        // 밝기가 128보다 작으면 어두운 배경이므로 흰색, 아니면 검은색
        return brightness < 128 ? '#FFFFFF' : '#000000';
    } catch (error) {
        console.error('[AccountCard] 색상 처리 오류:', error, backgroundColor);
        return '#000000'; // 기본값
    }
};

type AccountCardProps = AccountCardData & {
    style?: StyleProp<ViewStyle>;
    onViewTransactions?: () => void;
}

const AccountCard: React.FC<AccountCardProps> = ({
    bankId,
    accountName,
    accountNumber,
    balance,
    isPrimary = false,
    style,
    onViewTransactions,
}) => {
    // 서버의 bankId로 은행 정보 찾기
    const bankInfo = BANK_CODES[bankId as keyof typeof BANK_CODES];
    
    // bankInfo가 없으면 기본값 사용
    if (!bankInfo) {
        console.warn('[AccountCard] 은행 정보를 찾을 수 없습니다:', bankId);
        return null;
    }
    
    const textColor = getTextColor(bankInfo.color);
    const balanceFormatted = format.currency(balance);

    return (
        <View style={[styles.card, { backgroundColor: bankInfo.color }, style]}>
            {/* 대표 계좌 아이콘 */}
            {isPrimary && (
                <View style={styles.primaryStarContainer}>
                    <RepresentativeIcon 
                        width={28} 
                        height={28} 
                        fill={textColor}
                    />
                </View>
            )}
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
                {/* 계좌번호 + 거래내역 버튼 */}
                <View style={styles.accountNumberRow}>
                    <Text style={[styles.accountNumber, { color: textColor }]}>{accountNumber}</Text>
                    {onViewTransactions && (
                        <TouchableOpacity
                            style={[styles.transactionButton, { backgroundColor: textColor === '#FFFFFF' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }]}
                            onPress={onViewTransactions}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.transactionButtonText, { color: textColor }]}>거래내역</Text>
                        </TouchableOpacity>
                    )}
                </View>
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
        position: 'relative', // 별표 위치 지정을 위해
    },
    primaryStarContainer: {
        position: 'absolute',
        top: Spacing.sm,
        right: Spacing.sm,
        zIndex: 1,
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
    accountNumberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.sm,
        marginLeft: Spacing.sm,
    },
    accountNumber: {
        fontSize: Typography.fontSize.lg,
        textDecorationLine: 'underline',
        marginRight: Spacing.sm,
    },
    transactionButton: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: 12,
    },
    transactionButtonText: {
        fontSize: Typography.fontSize.sm,
        fontWeight: Typography.fontWeight.medium,
    },
    balance: {
        fontSize: Typography.fontSize['2xl'],
        fontWeight: Typography.fontWeight.bold,
        alignSelf: 'flex-end',
    },
});