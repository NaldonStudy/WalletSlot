import { create } from 'zustand';

type Carrier = 'SKT' | 'KT' | 'LG U+' | '알뜰폰';

// 상태 타입 정의
type SignupState = {
    name: string | null;
    residentFront6: string | null;
    residentBack1: string | null;
    phone: string | null;
    carrier: Carrier | null;
    signupTicket: string | null; // SMS 인증 완료 후 받은 signupTicket
    pin: string | null; // PIN 설정 완료 후 임시 저장
    isPushEnabled: boolean | null; // 알림 동의 여부
};

// 액션 타입 정의
type SignupActions = {
    setName: (v: string) => void;
    setResidentId: (front6: string, back1: string) => void;
    setResidentFront6: (front6: string) => void;
    setResidentBack1: (back1: string) => void;
    setPhone: (carrier: Carrier, phone: string) => void;
    setSignupTicket: (ticket: string) => void;
    setPin: (pin: string) => void;
    setPushEnabled: (enabled: boolean) => void;
    
    clearName: () => void;
    clearResidentId: () => void;
    clearPhone: () => void;
    clearSignupTicket: () => void;
    clearPin: () => void;
    clearPushEnabled: () => void;

    reset: () => void;

    // 유틸리티 함수들
    isNameValid: () => boolean;
    isResidentIdValid: () => boolean;
    isPhoneValid: () => boolean;
    hasSignupTicket: () => boolean;
};

// 전체 스토어 타입
type SignupStore = SignupState & SignupActions;

// 초기 상태
const initial: SignupState = {
    name: null,
    residentFront6: null,
    residentBack1: null,
    phone: null,
    carrier: null,
    signupTicket: null,
    pin: null,
    isPushEnabled: null,
};

export const useSignupStore = create<SignupStore>((set, get) => ({
    ...initial,

    setName: (v) => set({ name: v }),
    setResidentId: (front6, back1) => set({ residentFront6: front6, residentBack1: back1}),
    setResidentFront6: (front6) => set({ residentFront6: front6 }),
    setResidentBack1: (back1) => set({ residentBack1: back1 }),
    setPhone: (carrier, phone) => {
        // 숫자만 추출해 저장 (하이픈 등 구분자는 UI에서만 표시)
        const digits = phone.replace(/\D/g, '').slice(0, 11);
        set({ carrier, phone: digits });
    },
    setSignupTicket: (ticket) => set({ signupTicket: ticket }),
    setPin: (pin) => set({ pin: pin }),
    setPushEnabled: (enabled) => set({ isPushEnabled: enabled }),

    clearName: () => set({ name: null}),
    clearResidentId: () => set({ residentFront6: null, residentBack1: null}),
    clearPhone: () => set({ carrier: null, phone: null}),
    clearSignupTicket: () => set({ signupTicket: null }),
    clearPin: () => set({ pin: null }),
    clearPushEnabled: () => set({ isPushEnabled: null }),

    reset: () => set({ ...initial }),

    // 유틸리티 함수
    isNameValid: () => {
        const { name } = get();
        return name !== null && name.trim().length >= 2;
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
    },

    hasSignupTicket: () => {
        const { signupTicket } = get();
        return signupTicket !== null && signupTicket.length > 0;
    }
}));

