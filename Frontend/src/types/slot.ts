export interface SlotData {
  slotId: string;
  slotName: string;
  slotIcon: string;
  slotColor: string;
  budget: number;
  remaining: number;
}

export interface SlotsResponse {
  slots: SlotData[];
}
