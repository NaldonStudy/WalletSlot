import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SlotData } from '@/src/types';
import SlotItem from './SlotItem';
import { router } from 'expo-router';
import { useSlotStore } from '@/src/store/useSlotStore';

type SlotListProps = {
    slots: SlotData[];
    accountId: string;
};

const SlotList = ({ slots, accountId }: SlotListProps) => {
    return (
        <View style={styles.container}>
            {slots.map((slot, index) => (
                <View key={slot.slotId} style={styles.cardWrapper}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => {
                            useSlotStore.getState().setSelectedSlot({ ...slot, accountId });
                            router.push({
                                pathname: `/dashboard/slot/[slotId]`,
                                params: { slotId: slot.slotId, accountId },
                            });
                        }}>
                        <SlotItem slot={slot} />
                    </TouchableOpacity>
                    
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


