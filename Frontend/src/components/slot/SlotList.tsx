import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SlotData } from '@/src/types';
import SlotItem from './SlotItem';
import { router } from 'expo-router';
import { useSlotStore } from '@/src/store/useSlotStore';
import { UNCATEGORIZED_SLOT_ID } from '@/src/constants/slots';

type SlotListProps = {
  slots: SlotData[];
  accountId: string;
  openTooltipId?: string | null;
  setOpenTooltipId?: (id: string | null) => void;
};

const SlotList = ({ slots, accountId, openTooltipId, setOpenTooltipId }: SlotListProps) => {
  const [localOpenTooltipId, setLocalOpenTooltipId] = useState<string | null>(null);

  // 부모에서 상태 전달받으면 그걸 사용, 아니면 로컬 상태 사용
  const currentOpenTooltipId = openTooltipId !== undefined ? openTooltipId : localOpenTooltipId;
  const currentSetOpenTooltipId = setOpenTooltipId || setLocalOpenTooltipId;

  // 미분류 슬롯 제외
  const filteredSlots = slots.filter(slot => slot.slotId !== UNCATEGORIZED_SLOT_ID);

  const handleMenuPress = (slotId: string) => {
    currentSetOpenTooltipId(currentOpenTooltipId === slotId ? null : slotId);
  };

  const handleEdit = (slot: SlotData) => {
    currentSetOpenTooltipId(null);
    // Store에도 선택한 slot 저장 (화면에서 불러쓸 수 있게)
    useSlotStore.getState().setSelectedSlot({ ...slot, accountId });

    // ✅ 동적 라우팅 사용
    router.push({
      pathname: `/dashboard/slot/[slotId]/edit`,
      params: { slotId: slot.slotId, accountId },
    });
  };

  const handleHistory = (slot: SlotData) => {
    currentSetOpenTooltipId(null);
    // Store에도 선택한 slot 저장 (화면에서 불러쓸 수 있게)
    useSlotStore.getState().setSelectedSlot({ ...slot, accountId });

    // 히스토리 페이지로 이동
    router.push({
      pathname: `/dashboard/slot/[slotId]/history`,
      params: { slotId: slot.slotId, accountId },
    });
  };

  return (
    <View style={styles.container}>
      {filteredSlots.map((slot) => (
        <View key={slot.slotId} style={styles.cardWrapper}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              currentSetOpenTooltipId(null);

              if (currentOpenTooltipId === slot.slotId) return;

              useSlotStore.getState().setSelectedSlot({ ...slot, accountId });
              router.navigate({
                pathname: `/dashboard/slot/[slotId]`,
                params: { slotId: slot.slotId, accountId },
              });
            }}
          >
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
    marginBottom: 12,
  },
});
