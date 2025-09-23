import React, { useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View, Pressable } from 'react-native';
import { SlotData } from '@/src/types';
import SlotItem from './SlotItem';
import { router } from 'expo-router';
import { useSlotStore } from '@/src/store/useSlotStore';

type SlotListProps = {
    slots: SlotData[];
    accountId: string;
    openTooltipId?: string | null;
    setOpenTooltipId?: (id: string | null) => void;
};

const SlotList = ({ slots, accountId, openTooltipId, setOpenTooltipId }: SlotListProps) => {
    const [localOpenTooltipId, setLocalOpenTooltipId] = useState<string | null>(null);
    
    // 부모에서 전달받은 상태가 있으면 사용, 없으면 로컬 상태 사용
    const currentOpenTooltipId = openTooltipId !== undefined ? openTooltipId : localOpenTooltipId;
    const currentSetOpenTooltipId = setOpenTooltipId || setLocalOpenTooltipId;

    const handleMenuPress = (slotId: string) => {
        currentSetOpenTooltipId(currentOpenTooltipId === slotId ? null : slotId);
    };

    const handleEdit = (slot: SlotData) => {
        currentSetOpenTooltipId(null);
        // TODO: Implement edit functionality
        console.log('Edit slot:', slot.slotName);
    };

    const handleHistory = (slot: SlotData) => {
        currentSetOpenTooltipId(null);
        // TODO: Implement history functionality
        console.log('View history for slot:', slot.slotName);
    };

    return (
        <View style={styles.container}>
            {slots.map((slot, index) => (
                <View key={slot.slotId} style={styles.cardWrapper}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => {
                            // Close tooltip first
                            currentSetOpenTooltipId(null);
                            // Don't navigate if tooltip was open
                            if (currentOpenTooltipId === slot.slotId) {
                                return;
                            }
                            useSlotStore.getState().setSelectedSlot({ ...slot, accountId });
                            router.push({
                                pathname: `/dashboard/slot/[slotId]`,
                                params: { slotId: slot.slotId, accountId },
                            });
                        }}>
                        <SlotItem 
                            slot={slot} 
                            isTooltipOpen={currentOpenTooltipId === slot.slotId}
                            onMenuPress={() => handleMenuPress(slot.slotId)}
                            onEdit={() => handleEdit(slot)}
                            onHistory={() => handleHistory(slot)}
                        />
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


