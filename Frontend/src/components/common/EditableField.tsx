import { ThemedText } from '@/components/ThemedText';
import React, { useState } from 'react';
import {
  KeyboardTypeOptions,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

interface EditableFieldProps {
  label: string;
  value: string | null;
  placeholder?: string;
  editable?: boolean;
  keyboardType?: KeyboardTypeOptions;
  onSave?: (value: string) => void | Promise<void>;
  formatter?: (value: string) => string;
}

export const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  placeholder = '',
  editable = true,
  keyboardType = 'default',
  onSave,
  formatter,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const displayValue = value ? (formatter ? formatter(value) : value) : placeholder;

  const startEditing = () => {
    if (!editable) return;
    setEditValue(value || '');
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditValue('');
  };

  const saveValue = async () => {
    if (!onSave) return;

    setIsLoading(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save field:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      
      {isEditing ? (
        <View style={styles.editContainer}>
          <TextInput
            style={styles.input}
            value={editValue}
            onChangeText={setEditValue}
            placeholder={placeholder}
            keyboardType={keyboardType}
            autoFocus
            autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
          />
          <View style={styles.buttonContainer}>
            <Pressable
              onPress={cancelEditing}
              style={[styles.button, styles.cancelButton]}
              disabled={isLoading}
            >
              <ThemedText style={styles.cancelButtonText}>취소</ThemedText>
            </Pressable>
            <Pressable
              onPress={saveValue}
              style={[styles.button, styles.saveButton]}
              disabled={isLoading}
            >
              <ThemedText style={styles.saveButtonText}>
                {isLoading ? '저장 중...' : '저장'}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable
          onPress={startEditing}
          style={[
            styles.valueContainer,
            !editable && styles.readOnlyContainer,
          ]}
          disabled={!editable}
        >
          <ThemedText
            style={[
              styles.value,
              !value && styles.placeholder,
              !editable && styles.readOnlyValue,
            ]}
          >
            {displayValue}
          </ThemedText>
          {editable && <ThemedText style={styles.editIcon}>✏️</ThemedText>}
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#666',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    minHeight: 48,
  },
  readOnlyContainer: {
    backgroundColor: '#f0f0f0',
  },
  value: {
    fontSize: 16,
    flex: 1,
  },
  placeholder: {
    color: '#999',
    fontStyle: 'italic',
  },
  readOnlyValue: {
    color: '#666',
  },
  editIcon: {
    fontSize: 16,
    color: '#007AFF',
  },
  editContainer: {
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
    minHeight: 48,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});