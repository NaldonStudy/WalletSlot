import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SlotData } from '@/src/types';
import SlotItem from './SlotItem';

type SlotListProps = {
    slots: SlotData[];
};

const SlotList = ({ slots }: SlotListProps) => {
    return (
        <View style={styles.container}>
            {slots.map((slot, index) => (
                <View 
                    key={slot.slotId} 
                    style={styles.cardWrapper}
                >
                    <SlotItem slot={slot} />
                </View>
            ))}
        </View>
    );
};

export default SlotList;

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 10,
        paddingBottom: 24,
    },
    cardWrapper: {
        marginBottom: 12, // 카드들이 겹치도록
    },
});


