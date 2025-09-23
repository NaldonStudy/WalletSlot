import { Ionicons } from '@expo/vector-icons'
import React, { useEffect, useState } from 'react'
import { Alert, Modal, Pressable, ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { LoadingIndicator } from '@/src/components'
import { useDeleteLinkedAccount, useLinkedAccounts, useRefreshMyData } from '@/src/hooks'
import type { UserAccount } from '@/src/types'
import AccountConnectionDetail from './AccountConnectionDetail'

type Props = {
  visible: boolean
  onClose: () => void
}

type BankConnection = {
  accountId: string
  bankCode: string
  bankName: string
  bankColor: string
  accountNumber: string
  accountType: string
  accountName: string
  connectionDate: string
  expiryDate: string
  status: 'active' | 'expired' | 'suspended' | 'deleted'
  balance: number
}

export default function ConnectedBanks({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets()
  const [connections, setConnections] = useState<BankConnection[]>([])
  const [selectedConnection, setSelectedConnection] = useState<BankConnection | null>(null)
  
  // 새로운 API hooks 사용
  const { data: linkedAccounts, isLoading: loading, error } = useLinkedAccounts()
  const deleteAccountMutation = useDeleteLinkedAccount()
  const refreshMyDataMutation = useRefreshMyData()

  // 연동된 계좌 데이터 타입은 UserAccount[]

  // 은행별 색상 매핑
  const getBankColor = (bankCode: string): string => {
    const colorMap: Record<string, string> = {
      '004': '#FFB400', // KB국민은행
      '088': '#0066CC', // 신한은행  
      '020': '#004A9C', // 우리은행
      '081': '#009639', // 하나은행
      '011': '#00A651', // NH농협은행
      '027': '#E60012', // 씨티은행
      '089': '#005AA0', // 케이뱅크
      '090': '#FF6900', // 카카오뱅크
      '002': '#003876', // 산업은행
      '003': '#ED1C24', // 기업은행
    };
    return colorMap[bankCode] || '#1976d2';
  };

  // 연동된 계좌 목록을 BankConnection 형태로 변환
  useEffect(() => {
    if (linkedAccounts) {
      const converted: BankConnection[] = (linkedAccounts as UserAccount[]).map(account => ({
        accountId: account.accountId,
        bankCode: account.bankCode,
        bankName: account.bankName,
        bankColor: getBankColor(account.bankCode),
        accountNumber: account.accountNo,
        accountType: '일반계좌', // 기본값
        accountName: account.accountAlias || '연동된 계좌',
        connectionDate: '2024-01-01', // 기본값
        expiryDate: '2025-12-31', // 기본값
        status: 'active' as const,
        balance: account.balance || 0,
      }))
      setConnections(converted)
    }
  }, [linkedAccounts])

  // 마이데이터 재연동
  const handleRefreshMyData = async () => {
    try {
      await refreshMyDataMutation.mutateAsync()
      // 성공 시에는 별도 알림 없이 목록이 자동 갱신됨
    } catch (error) {
      Alert.alert('오류', '마이데이터 재연동에 실패했습니다.')
    }
  }

  // 계좌 삭제
  const handleDeleteAccount = async (accountId: string) => {
    Alert.alert(
      '계좌 연동 해제',
      '이 계좌의 연동을 해제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '해제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccountMutation.mutateAsync(accountId)
              // 성공 시에는 별도 알림 없이 목록에서 자동 제거됨
            } catch (error) {
              Alert.alert('오류', '계좌 연동 해제에 실패했습니다.')
            }
          }
        }
      ]
    )
  }

  // 모달이 열릴 때는 자동으로 데이터가 로드됨 (React Query)
  // 별도 로직 불필요

  // 은행별로 그룹화
  const bankGroups = (connections || []).reduce((groups, connection) => {
    const bankName = connection.bankName
    if (!groups[bankName]) {
      groups[bankName] = []
    }
    groups[bankName].push(connection)
    return groups
  }, {} as Record<string, BankConnection[]>)

  // 만료일 포맷팅
  const formatExpiryDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return '만료됨'
    } else if (diffDays < 30) {
      return `${diffDays}일 후 만료`
    } else {
      return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} 만료`
    }
  }

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <ThemedView style={{ flex: 1, paddingTop: insets.top }}>
        {/* Header */}
        <View style={{
          padding: 18,
          borderBottomWidth: 1,
          borderColor: '#f0f0f0',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          backgroundColor: 'white'
        }}>
          <ThemedText style={{ fontSize: 20, fontWeight: '700' }}>연결 금융사 관리</ThemedText>
          <Pressable onPress={onClose} style={{ position: 'absolute', left: 18 }} accessibilityLabel="뒤로">
            <Ionicons name="chevron-back" size={24} color="#333" />
          </Pressable>
        </View>

        {/* Content */}
        <ScrollView
          style={{ flex: 1, backgroundColor: '#f8f9fa' }}
          contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <LoadingIndicator text="연결된 금융사 정보를 불러오는 중..." />
          ) : error ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 }}>
              <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
              <ThemedText style={{ marginTop: 16, color: '#666', textAlign: 'center' }}>
                {error?.message || '데이터를 불러오는 중 오류가 발생했습니다.'}
              </ThemedText>
              <Pressable
                onPress={handleRefreshMyData}
                style={{
                  backgroundColor: '#007AFF',
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  marginTop: 16
                }}
              >
                <ThemedText style={{ color: 'white', fontWeight: '600' }}>다시 시도</ThemedText>
              </Pressable>
            </View>
          ) : (!connections || connections.length === 0) ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 }}>
              <Ionicons name="wallet-outline" size={48} color="#999" />
              <ThemedText style={{ marginTop: 16, color: '#666', textAlign: 'center' }}>연결된 금융사가 없습니다</ThemedText>
              <Pressable
                onPress={handleRefreshMyData}
                style={{
                  backgroundColor: '#007AFF',
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  marginTop: 16
                }}
              >
                <ThemedText style={{ color: 'white', fontWeight: '600' }}>마이데이터 연동하기</ThemedText>
              </Pressable>
            </View>
          ) : (
            <>
              {Object.entries(bankGroups).map(([bankName, connections]) => (
                <View key={bankName} style={{ marginBottom: 24 }}>
                  {/* 은행 섹션 헤더 */}
                  <ThemedText style={{
                    fontSize: 14,
                    color: '#666',
                    marginBottom: 12,
                    fontWeight: '600'
                  }}>
                    {bankName}
                  </ThemedText>

                  {/* 해당 은행의 연결된 계좌들 */}
                  {connections.map((connection) => (
                    <Pressable
                      key={connection.accountId}
                      onPress={() => setSelectedConnection(connection)}
                      style={{
                        backgroundColor: 'white',
                        borderRadius: 12,
                        padding: 16,
                        marginBottom: 12,
                        borderWidth: 1,
                        borderColor: '#e0e0e0',
                        flexDirection: 'row',
                        alignItems: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.05,
                        shadowRadius: 2,
                        elevation: 1
                      }}
                    >
                  {/* 은행 아이콘 */}
                  <View style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: connection.bankColor,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12
                  }}>
                    <Ionicons name="card-outline" size={24} color="white" />
                  </View>

                  {/* 계좌 정보 */}
                  <View style={{ flex: 1 }}>
                    <ThemedText style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: '#333',
                      marginBottom: 4
                    }}>
                      {connection.accountName}
                    </ThemedText>
                    <ThemedText style={{
                      fontSize: 14,
                      color: '#666',
                      marginBottom: 2
                    }}>
                      {connection.accountNumber.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-****')}
                    </ThemedText>
                    <ThemedText style={{
                      fontSize: 12,
                      color: connection.status === 'expired' ? '#FF3B30' : 
                             connection.status === 'suspended' ? '#FF9500' : '#34C759'
                    }}>
                      {formatExpiryDate(connection.expiryDate)}
                    </ThemedText>
                  </View>

                  {/* 화살표 아이콘 */}
                  <Ionicons name="chevron-forward" size={20} color="#666" />
                </Pressable>
              ))}
            </View>
          ))}
              
              {/* 새 금융사 연결 버튼 */}
              <Pressable
            onPress={() => {
              Alert.alert('준비 중', '새 금융사 연결 기능을 준비 중입니다.')
            }}
            style={{
              backgroundColor: '#007AFF',
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
              marginTop: 8
            }}
          >
                <ThemedText style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: 'white'
                }}>
                  새 금융사 연결하기
                </ThemedText>
              </Pressable>
            </>
          )}
        </ScrollView>
      </ThemedView>

      {/* 계좌 상세 관리 모달 */}
      {selectedConnection && (
        <AccountConnectionDetail
          visible={!!selectedConnection}
          onClose={() => setSelectedConnection(null)}
          connection={selectedConnection}
          onConnectionUpdated={() => {
            // React Query가 자동으로 캐시를 무효화하므로 별도 처리 불필요
          }}
        />
      )}
    </Modal>
  )
}