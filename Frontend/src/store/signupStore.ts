import { create } from 'zustand';

type Carrier = 'SK' | 'KT' | 'LG' | '알뜰폰';

type SignupStore = {
    name: string | null;
    residentFront6: string | null;
    residentBack1: string | null;
    phone: string | null;
    carrier: Carrier | null

    setName: (v: string) => void;
    setResidentId: (front6: string, back1: string) => void;
    setPhone: (carrier: Carrier, phone: string) => void;
    
    clearName: () => void;
    clearResidentId: () => void;
    clearPhone: () => void;

    reset: () => void;
};

const initial: Omit<SignupStore, 'setName' | 'setResidentId' | 'setPhone' | 'clearName' | 'clearResidentId' | 'clearPhone' | 'reset'> = {
    name: null,
    residentFront6: null,
    residentBack1: null,
    phone: null,
    carrier: null,
};

export const useSignupStore = create<SignupStore>((set) => ({
    ...initial,

    setName: (v) => set({ name: v }),
    setResidentId: (front6, back1) => set({ residentFront6: front6, residentBack1: back1}),
    setPhone: (carrier, phone) => set({ carrier, phone}),

    clearName: () => set({ name: null}),
    clearResidentId: () => set({ residentFront6: null, residentBack1: null}),
    clearPhone: () => set({ carrier: null, phone: null}),

    reset: () => set({ ...initial }),
}));

