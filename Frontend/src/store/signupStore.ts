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

export const useSignupStore = create<SignupStore>((set, get) => ({
    ...initial,

    setName: (v) => set({ name: v }),
    setResidentId: (front6, back1) => set({ residentFront6: front6, residentBack1: back1}),
    setPhone: (carrier, phone) => {
        // 숫자만 추출해 저장 (하이픈 등 구분자는 UI에서만 표시)
        const digits = phone.replace(/\D/g, '').slice(0, 11);
        set({ carrier, phone: digits });
    },

    clearName: () => set({ name: null}),
    clearResidentId: () => set({ residentFront6: null, residentBack1: null}),
    clearPhone: () => set({ carrier: null, phone: null}),

    reset: () => set({ ...initial }),

    // 유틸리티 함수
    isNameValid: () => {
        const { name } = get();
        return name !== null && name.trim() !== '';
    },

    isResidentIdValid: () => {
        const { residentFront6, residentBack1 } = get();
        if (!residentFront6 || !residentBack1) return false;
        if (residentFront6.length !== 6 || residentBack1.length !== 1) return false;

        // 뒷자리 첫 번쨰 숫자가 1,2,3,4 중 하나여야 함
        const validBackNumbers = ['1', '2', '3', '4'];
        if (!validBackNumbers.includes(residentBack1)) return false;
        
        // 앞 6자리가 숫자인지 확인
        if (!/^\d{6}$/.test(residentFront6)) {
            return false;
        }
        
        // 생년월일 유효성 검사 (선택사항)
        const year = parseInt(residentFront6.substring(0, 2));
        const month = parseInt(residentFront6.substring(2, 4));
        const day = parseInt(residentFront6.substring(4, 6));
        
        if (month < 1 || month > 12 || day < 1 || day > 31) {
            return false;
        }
        return true;
    },

    isPhoneValid: () => {
        const { carrier, phone } = get();
        if (!carrier || !phone) return false;
        const digits = phone.replace(/\D/g, '');
        return digits.length === 11 && digits.startsWith('010');
    }
}));

