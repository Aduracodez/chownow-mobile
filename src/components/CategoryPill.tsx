import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';
import { CategoryItem } from '../types';

interface CategoryPillProps {
  category: CategoryItem;
  isSelected: boolean;
  onSelect: () => void;
}

export const CategoryPill: React.FC<CategoryPillProps> = ({
  category,
  isSelected,
  onSelect,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onSelect}
      style={[
        styles.container,
        isSelected ? styles.selectedContainer : styles.unselectedContainer,
      ]}
    >
      <View
        style={[
          styles.imageWrapper,
          isSelected ? styles.selectedImageWrapper : styles.unselectedImageWrapper,
        ]}
      >
        <Image source={{ uri: category.image }} style={styles.image} resizeMode="cover" />
      </View>
      <Text
        style={[
          styles.title,
          isSelected ? styles.selectedTitle : styles.unselectedTitle,
        ]}
        numberOfLines={1}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: RADIUS.lg,
    marginRight: 12,
    minWidth: 78,
  },
  selectedContainer: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.sm,
  },
  unselectedContainer: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  imageWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 6,
  },
  selectedImageWrapper: {
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  unselectedImageWrapper: {
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
  },
  selectedTitle: {
    color: COLORS.white,
  },
  unselectedTitle: {
    color: COLORS.text,
  },
});
