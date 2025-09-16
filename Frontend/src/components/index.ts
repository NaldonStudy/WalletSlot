/*
 * 📦 컴포넌트 중앙 Export 파일
 * 
 * 목적:
 * - 공통 컴포넌트들의 중앙 집중식 export
 * - import 경로 단순화 및 일관성 제공
 * - 타입 정의도 함께 export하여 TypeScript 지원
 * 
 * 사용법:
 * import { Button, NotificationRow } from '@/src/components';
 * 
 * 구조:
 * - 공통 UI 컴포넌트 (Button, InputField 등)
 * - 도메인별 컴포넌트 (알림, 슬롯, 계좌 등)
 * - 타입 정의 함께 export
 */

// 공통 컴포넌트 export
export { Button } from './Button';
export type { ButtonProps } from './Button';

export { InputField } from './InputField';
export type { InputFieldProps } from './InputField';

// 알림 관련 컴포넌트
export { NotificationFilters } from './NotificationFilters';
export { NotificationRow } from './NotificationItem';

// TODO: 추가할 공통 컴포넌트들
// export { Card } from './Card';
// export { Modal } from './Modal';
// export { LoadingSpinner } from './LoadingSpinner';
// export { SlotCard } from './SlotCard';
// export { PieChart } from './PieChart';
// export { TabBar } from './TabBar';
// export { Header } from './Header';
// export { IconButton } from './IconButton';
// export { Switch } from './Switch';
// export { Slider } from './Slider';
// export { Toast } from './Toast';
// export { Badge } from './Badge';
// export { Avatar } from './Avatar';
// export { Divider } from './Divider';
// export { SafeAreaView } from './SafeAreaView';
// export { KeyboardAvoidingView } from './KeyboardAvoidingView';
