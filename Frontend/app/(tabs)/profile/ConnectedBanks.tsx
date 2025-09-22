import { Ionicons } from '@expo/vector-icons'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
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

type ApiResponse = {
  success: boolean
  data: {
    connections: BankConnection[]
    totalCount: number
    activeCount: number
  }
}

export default function ConnectedBanks({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets()
  const [connections, setConnections] = useState<BankConnection[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedConnection, setSelectedConnection] = useState<BankConnection | null>(null)

  // 연결된 금융사 목록 조회
  const fetchConnections = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('[ConnectedBanks] API 호출 시작: /api/users/me/mydata/connections')
      const response = await fetch('/api/users/me/mydata/connections')
      console.log('[ConnectedBanks] API 응답 상태:', response.status)
      
      const data: ApiResponse = await response.json()
      console.log('[ConnectedBanks] API 응답 데이터:', data)
      
      if (data.success) {
        console.log('[ConnectedBanks] 연결 설정:', data.data.connections)
        setConnections(data.data.connections)
      } else {
        setError('연결된 금융사 정보를 불러올 수 없습니다.')
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.')
      console.error('Failed to fetch connections:', err)
    } finally {
      setLoading(false)
    }
  }

  // 계좌 연결 목록 새로고침 (AccountConnectionDetail에서 사용)
  const refreshConnections = () => {
    fetchConnections()
  }

  // 모달이 열릴 때 데이터 로드
  useEffect(() => {
    if (visible) {
      fetchConnections()
    }
  }, [visible])

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
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 }}>
              <ActivityIndicator size="large" color="#007AFF" />
              <ThemedText style={{ marginTop: 16, color: '#666' }}>연결된 금융사 정보를 불러오는 중...</ThemedText>
            </View>
          ) : error ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 }}>
              <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
              <ThemedText style={{ marginTop: 16, color: '#666', textAlign: 'center' }}>{error}</ThemedText>
              <Pressable
                onPress={fetchConnections}
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
          ) : Object.keys(bankGroups).length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 }}>
              <Ionicons name="wallet-outline" size={48} color="#999" />
              <ThemedText style={{ marginTop: 16, color: '#666', textAlign: 'center' }}>연결된 금융사가 없습니다</ThemedText>
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
          onConnectionUpdated={refreshConnections}
        />
      )}
    </Modal>
  )
}