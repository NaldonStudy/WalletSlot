import { ThemedText } from '@/components/ThemedText';
import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

interface AvatarProps {
  uri?: string | null;
  size?: number;
  editable?: boolean;
  onPress?: () => void;
}

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  size = 120,
  editable = false,
  onPress,
}) => {
  const avatarStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const content = uri ? (
    <Image source={{ uri }} style={[styles.avatar, avatarStyle]} />
  ) : (
    <View style={[styles.placeholder, avatarStyle]}>
      <ThemedText style={[styles.placeholderIcon, { fontSize: size * 0.3 }]}>
        👤
      </ThemedText>
    </View>
  );

  if (editable && onPress) {
    return (
      <Pressable onPress={onPress} style={styles.container}>
        {content}
        <View style={styles.editOverlay}>
          <ThemedText style={styles.editText}>변경</ThemedText>
        </View>
      </Pressable>
    );
  }

  return <View style={styles.container}>{content}</View>;
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  avatar: {
    borderColor: '#e0e0e0',
    borderWidth: 2,
  },
  placeholder: {
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#e0e0e0',
    borderWidth: 2,
  },
  placeholderIcon: {
    color: '#999',
  },
  editOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: 'white',
  },
  editText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});