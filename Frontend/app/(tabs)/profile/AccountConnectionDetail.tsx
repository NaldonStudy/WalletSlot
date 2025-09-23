import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Alert, Modal, Pressable, ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { SimpleLoadingIndicator } from '@/src/components'
import { useDeleteLinkedAccount } from '@/src/hooks/useSettings'

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

type Props = {
  visible: boolean
  onClose: () => void
  connection: BankConnection | null
  onConnectionUpdated: () => void
}

export default function AccountConnectionDetail({ visible, onClose, connection, onConnectionUpdated }: Props) {
  const insets = useSafeAreaInsets()
  const deleteLinkedAccountMutation = useDeleteLinkedAccount()

  if (!connection) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}.`
  }

  const handleDisconnect = () => {
    Alert.alert(
      '계좌 연결 해제',
      `${connection.bankName} ${connection.accountName}의 연결을 해제하시겠습니까?\n\n연결을 해제하면 해당 계좌의 정보를 더 이상 조회할 수 없습니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '연결 해제',
          style: 'destructive',
          onPress: () => {
            deleteLinkedAccountMutation.mutate(connection.accountId, {
              onSuccess: () => {
                Alert.alert(
                  '완료', 
                  '계좌 연결이 성공적으로 해제되었습니다.',
                  [
                    {
                      text: '확인',
                      onPress: () => {
                        onConnectionUpdated() // 콜백 호출 (필요한 경우)
                        onClose() // 상세 페이지 닫기
                      }
                    }
                  ]
                )
              },
              onError: (error) => {
                Alert.alert('오류', '연결 해제에 실패했습니다.')
              }
            })
          }
        }
      ]
    )
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
          <ThemedText style={{ fontSize: 20, fontWeight: '700' }}>{connection.bankName} 연결 관리</ThemedText>
          <Pressable onPress={onClose} style={{ position: 'absolute', left: 18 }} accessibilityLabel="뒤로">
            <Ionicons name="chevron-back" size={24} color="#333" />
          </Pressable>
        </View>

        <ScrollView
          style={{ flex: 1, backgroundColor: '#f8f9fa' }}
          contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* 계좌 정보 카드 */}
          <View style={{
            backgroundColor: 'white',
            borderRadius: 12,
            padding: 20,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: '#e0e0e0',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
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
              <View style={{ flex: 1 }}>
                <ThemedText style={{ fontSize: 18, fontWeight: '700', color: '#333' }}>
                  {connection.accountType}
                </ThemedText>
                <ThemedText style={{ fontSize: 14, color: '#666', marginTop: 2 }}>
                  {connection.accountNumber.replace(/(\d{3})(\d{4})(\d{4})(\d{4})/, '$1**************')}
                </ThemedText>
              </View>
            </View>
          </View>

          {/* 연결 정보 */}
          <View style={{
            backgroundColor: 'white',
            borderRadius: 12,
            padding: 20,
            marginBottom: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1
          }}>
            <View style={{ marginBottom: 16 }}>
              <ThemedText style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>연결일</ThemedText>
              <ThemedText style={{ fontSize: 16, color: '#333' }}>{formatDate(connection.connectionDate)}</ThemedText>
            </View>

            <View style={{ marginBottom: 16 }}>
              <ThemedText style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>연결 만료일</ThemedText>
              <ThemedText style={{ fontSize: 16, color: '#333' }}>{formatDate(connection.expiryDate)}</ThemedText>
            </View>

            <View>
              <ThemedText style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>동의 항목</ThemedText>
              <ThemedText style={{ fontSize: 16, color: '#333' }}>
                자동 업데이트, 잔액, 내역
              </ThemedText>
            </View>
          </View>

          <View style={{ height: 1, backgroundColor: '#e0e0e0', marginVertical: 12 }} />

          {/* 액션 버튼들 */}
          <View style={{ gap: 12 }}>
            <Pressable
              onPress={handleDisconnect}
              disabled={deleteLinkedAccountMutation.isPending}
              style={{
                backgroundColor: 'white',
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: '#FF3B30',
                alignItems: 'center',
                opacity: deleteLinkedAccountMutation.isPending ? 0.5 : 1,
                flexDirection: 'row',
                justifyContent: 'center'
              }}
            >
              {deleteLinkedAccountMutation.isPending && (
                <View style={{ marginRight: 8 }}>
                  <SimpleLoadingIndicator color="#FF3B30" />
                </View>
              )}
              <ThemedText style={{ fontSize: 16, fontWeight: '600', color: '#FF3B30' }}>
                {deleteLinkedAccountMutation.isPending ? '연결 해제 중...' : '계좌 연결 해제'}
              </ThemedText>
            </Pressable>
          </View>
        </ScrollView>
      </ThemedView>
    </Modal>
  )
}