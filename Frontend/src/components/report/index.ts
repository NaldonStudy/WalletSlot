/**
 * 지출 리포트 관련 컴포넌트들을 통합하여 export하는 모듈
 * 
 * 포함된 컴포넌트들:
 * - SpendingReportHeader: 리포트 헤더 (기간, 제목)
 * - BudgetOverview: 예산 대비 지출 현황 요약
 * - CategoryAnalysis: 슬롯(카테고리)별 예산 사용 분석
 * - TopSpendingChart: 상위 3대 지출 카테고리 차트
 * - BudgetSuggestionCard: AI 기반 다음 달 예산 제안
 * - PersonalizedInsightCard: 개인화 소비 패턴 인사이트
 * - PeerComparisonCard: 동일 그룹 또래와의 지출 비교
 */

export { BudgetOverview } from './BudgetOverview';
export { BudgetSuggestionCard } from './BudgetSuggestion';
export { CategoryAnalysis } from './CategoryAnalysis';
export { PeerComparisonCard } from './PeerComparison';
export { PersonalizedInsightCard } from './PersonalizedInsight';
export { SpendingReportHeader } from './SpendingReportHeader';
export { TopSpendingChart } from './TopSpendingChart';

