import React from 'react';
import { View, FlatList, StyleSheet, Dimensions, NativeScrollEvent, NativeSyntheticEvent  } from 'react-native';
import AccountCard, { AccountCardData } from './AccountCard';

const { width: screenWidth } = Dimensions.get('window');

type AccountCarouselProps = {
    accounts: AccountCardData[];
    onIndexChange?: (index: number) => void;
    initialIndex?: number;
};

const CARD_WIDTH = screenWidth * 0.7;
const CARD_MARGIN = 12;

const offset = CARD_WIDTH + CARD_MARGIN*2;

const AccountCarousel: React.FC<AccountCarouselProps> = ({ accounts, onIndexChange, initialIndex = 0 }) => {
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
                initialScrollIndex={initialIndex}
                getItemLayout={(data, index) => ({
                    length: offset,
                    offset: offset * index,
                    index,
                })}
                contentContainerStyle={{
                    paddingHorizontal: (screenWidth - CARD_WIDTH) / 2 - CARD_MARGIN,
                }}
                onMomentumScrollEnd={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
                    const index = Math.round(event.nativeEvent.contentOffset.x / offset);
                    onIndexChange?.(index);
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