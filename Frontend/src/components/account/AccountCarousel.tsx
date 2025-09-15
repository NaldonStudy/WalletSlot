import React from 'react';
import { View, FlatList, StyleSheet, Dimensions } from 'react-native';
import AccountCard from './AccountCard';
import { BANK_CODES } from '@/src/constants/banks';

const { width: screenWidth } = Dimensions.get('window');


type AccountCarouselProps = {
    accounts: {
        bankCode: keyof typeof BANK_CODES;
        accountName: string;
        accountNumber: string;
        balanceFormatted: string;
    }[];
};

const CARD_WIDTH = screenWidth * 0.7;
const CARD_MARGIN = 12;

const offset = CARD_WIDTH + CARD_MARGIN*2;

const AccountCarousel: React.FC<AccountCarouselProps> = ({ accounts }) => {
    return (
        <View style={styles.container}>
            <FlatList
                data={accounts}
                renderItem={({ item }) =>
                    <AccountCard {...item} style={{ width: CARD_WIDTH, marginHorizontal: CARD_MARGIN }} />}
                keyExtractor={(item) => item.accountNumber}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                snapToInterval={offset}
                decelerationRate="fast"
                contentContainerStyle={{
                    paddingHorizontal: (screenWidth - CARD_WIDTH) / 2 - CARD_MARGIN,
                  }}
            />
        </View>
    );
};

export default AccountCarousel;

const styles = StyleSheet.create({
    container: {
        width: screenWidth,
    },
});