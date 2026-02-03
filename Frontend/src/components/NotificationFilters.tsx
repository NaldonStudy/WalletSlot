/*
 * 🔍 알림 필터 컴포넌트 - 알림 목록 필터링 UI
 * 
 * 주요 기능:
 * - 기본 필터: 전체, 읽지 않음, 읽음 상태별 필터링
 * - 고급 필터: 알림 타입별, 날짜 범위별 필터링
 * - 필터 확장/축소 토글 기능
 * - 필터 결과 카운트 표시
 * 
 * 필터 타입:
 * - 상태별: all, unread, read
 * - 타입별: budget_exceeded, goal_achieved, spending_pattern, account_sync, system
 * - 기간별: all, today, week(7일), month(30일)
 * 
 * UI/UX:
 * - 선택된 필터는 primary 색상으로 강조 표시
 * - 가로 스크롤 지원으로 많은 타입 필터 처리
 * - 접근성 라벨 제공
 */

import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface NotificationFiltersProps {
  theme: any;
  selectedFilter: 'all' | 'unread' | 'read';
  onFilterChange: (filter: 'all' | 'unread' | 'read') => void;
  selectedTypeFilter: string;
  onTypeFilterChange: (type: string) => void;
  selectedDateRange: 'all' | 'today' | 'week' | 'month';
  onDateRangeChange: (range: 'all' | 'today' | 'week' | 'month') => void;
  isFilterExpanded: boolean;
  onToggleFilterExpanded: () => void;
  notificationsCount: number;
  unreadCount: number;
  notificationTypes: string[];
  filteredCount: number;
}

export const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  theme,
  selectedFilter,
  onFilterChange,
  selectedTypeFilter,
  onTypeFilterChange,
  selectedDateRange,
  onDateRangeChange,
  isFilterExpanded,
  onToggleFilterExpanded,
  notificationsCount,
  unreadCount,
  notificationTypes,
  filteredCount,
}) => {
  const getTypeDisplayName = (type: string) => {
    switch (type) {
      case 'SYSTEM': return '시스템';
      case 'DEVICE': return '디바이스';
      case 'BUDGET': return '예산';
      case 'TRANSACTION': return '거래';
      case 'MARKETING': return '마케팅';
      // 레거시 타입들 호환성 유지
      case 'budget_exceeded': return '예산초과';
      case 'goal_achieved': return '목표달성';
      case 'spending_pattern': return '지출패턴';
      case 'account_sync': return '계좌동기화';
      case 'system': return '시스템';
      default: return type;
    }
  };

  return (
    <ThemedView style={styles.wrapper}>
      {/* 기본 필터 버튼 */}
      <ThemedView style={styles.filterSection}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === 'all' && { 
              backgroundColor: theme.colors.primary[500] 
            }
          ]}
          onPress={() => onFilterChange('all')}
        >
          <ThemedText style={[
            styles.filterButtonText,
            { color: selectedFilter === 'all' ? '#FFFFFF' : theme.colors.text.secondary }
          ]}>
            전체 ({notificationsCount})
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.filterButton,
            selectedFilter === 'unread' && { 
              backgroundColor: theme.colors.primary[500] 
            }
          ]}
          onPress={() => onFilterChange('unread')}
        >
          <ThemedText style={[
            styles.filterButtonText,
            { color: selectedFilter === 'unread' ? '#FFFFFF' : theme.colors.text.secondary }
          ]}>
            읽지 않음 ({unreadCount})
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.filterButton,
            selectedFilter === 'read' && { 
              backgroundColor: theme.colors.primary[500] 
            }
          ]}
          onPress={() => onFilterChange('read')}
        >
          <ThemedText style={[
            styles.filterButtonText,
            { color: selectedFilter === 'read' ? '#FFFFFF' : theme.colors.text.secondary }
          ]}>
            읽음 ({notificationsCount - unreadCount})
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
      
      {/* 고급 필터 토글 버튼 */}
      <TouchableOpacity 
        style={styles.advancedFilterToggle}
        onPress={onToggleFilterExpanded}
      >
        <ThemedText style={[styles.advancedFilterText, { color: theme.colors.primary[600] }]}>
          고급 필터 {isFilterExpanded ? '▲' : '▼'}
        </ThemedText>
      </TouchableOpacity>
      
      {/* 고급 필터 섹션 */}
      {isFilterExpanded && (
        <ThemedView style={styles.advancedFilterSection}>
          {/* 알림 타입 필터 */}
          <ThemedView style={styles.filterRow}>
            <ThemedText style={[styles.filterLabel, { color: theme.colors.text.primary }]}>
              알림 타입:
            </ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
              <TouchableOpacity
                style={[
                  styles.typeFilterButton,
                  selectedTypeFilter === 'all' && { backgroundColor: theme.colors.primary[500] }
                ]}
                onPress={() => onTypeFilterChange('all')}
              >
                <ThemedText style={[
                  styles.typeFilterText,
                  { color: selectedTypeFilter === 'all' ? '#FFFFFF' : theme.colors.text.secondary }
                ]}>
                  전체
                </ThemedText>
              </TouchableOpacity>
              
              {notificationTypes.map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeFilterButton,
                    selectedTypeFilter === type && { backgroundColor: theme.colors.primary[500] }
                  ]}
                  onPress={() => onTypeFilterChange(type)}
                >
                  <ThemedText style={[
                    styles.typeFilterText,
                    { color: selectedTypeFilter === type ? '#FFFFFF' : theme.colors.text.secondary }
                  ]}>
                    {getTypeDisplayName(type)}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </ThemedView>
          
          {/* 날짜 범위 필터 */}
          <ThemedView style={styles.filterRow}>
            <ThemedText style={[styles.filterLabel, { color: theme.colors.text.primary }]}>
              기간:
            </ThemedText>
            <ThemedView style={styles.dateFilterContainer}>
              {[
                { key: 'all', label: '전체' },
                { key: 'today', label: '오늘' },
                { key: 'week', label: '7일' },
                { key: 'month', label: '30일' }
              ].map(option => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.dateFilterButton,
                    selectedDateRange === option.key && { backgroundColor: theme.colors.primary[500] }
                  ]}
                  onPress={() => onDateRangeChange(option.key as any)}
                >
                  <ThemedText style={[
                    styles.dateFilterText,
                    { color: selectedDateRange === option.key ? '#FFFFFF' : theme.colors.text.secondary }
                  ]}>
                    {option.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ThemedView>
          </ThemedView>
          
          {/* 필터 결과 요약 */}
          <ThemedText style={[styles.filterSummary, { color: theme.colors.text.tertiary }]}>
            {filteredCount}개 알림 (전체 {notificationsCount}개 중)
          </ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  filterSection: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  wrapper: {
    // wrapper allows safe top-level styling and prevents Fragment prop warnings
    width: '100%',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  advancedFilterToggle: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  advancedFilterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  advancedFilterSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  filterRow: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  filterScrollView: {
    flexGrow: 0,
  },
  typeFilterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  typeFilterText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dateFilterContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  dateFilterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    minWidth: 50,
    alignItems: 'center',
  },
  dateFilterText: {
    fontSize: 12,
    fontWeight: '500',
  },
  filterSummary: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});