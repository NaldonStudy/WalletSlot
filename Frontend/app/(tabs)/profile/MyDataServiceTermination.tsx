import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  visible: boolean;
  onClose: () => void;
  onManageConnections: () => void;
};

export default function MyDataServiceTermination({ visible, onClose, onManageConnections }: Props) {
  const handleTerminateService = () => {
    Alert.alert(
      '마이데이터 서비스 해지',
      '정말로 마이데이터 서비스를 해지하시겠습니까?\n\n해지 시 모든 연결된 금융사 정보가 삭제되며, 복구할 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '해지',
          style: 'destructive',
          onPress: () => {
            // TODO: 실제 API 연동 필요
            Alert.alert('완료', '마이데이터 서비스가 성공적으로 해지되었습니다.', [
              { text: '확인', onPress: onClose }
            ]);
          }
        }
      ]
    );
  };

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </Pressable>
          <Text style={styles.headerTitle}>마이데이터 서비스 해지</Text>
        </View>

        {/* 컨텐츠 */}
        <View style={styles.content}>
          <View style={styles.warningContainer}>
            <Ionicons name="warning" size={48} color="#FF6B35" />
            <Text style={styles.warningTitle}>마이데이터 서비스 해지 전 확인해주세요!</Text>
            <Text style={styles.warningText}>
              서비스 해지 시 모든 연결된 금융 정보가 삭제되며,{'\n'}
              다시 복구할 수 없습니다. 금융사 연결을 통해 수집된{'\n'}
              개인 데이터 및 모든 슬롯 정보가 영영히 사라집니다.
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.manageButton}
              onPress={() => {
                onClose();
                onManageConnections();
              }}
            >
              <Text style={styles.manageButtonText}>연결 금융사 관리</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.terminateButton}
              onPress={handleTerminateService}
            >
              <Text style={styles.terminateButtonText}>마이데이터 서비스 해지</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>해지를 원하시는 이유가 있다면?</Text>
            <Text style={styles.infoText}>
              개별 금융사 연결해제를 원하신다면 &quot;연결 금융사 관리&quot;를 통해{'\n'}
              원하는 금융사만 해제할 수 있습니다.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  warningContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  warningText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 40,
  },
  manageButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  manageButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  terminateButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  terminateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
});