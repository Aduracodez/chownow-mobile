import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { COLORS } from '../constants/theme';

interface RatingStarsProps {
  rating: number;
  ratingCount?: number;
  size?: number;
  showCount?: boolean;
  style?: ViewStyle;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  ratingCount,
  size = 14,
  showCount = true,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name="star" size={size} color={COLORS.star} />
      <Text style={[styles.ratingText, { fontSize: size + 0.5 }]}>
        {rating.toFixed(1)}
      </Text>
      {showCount && ratingCount !== undefined ? (
        <Text style={[styles.countText, { fontSize: size - 1 }]}>
          ({ratingCount > 999 ? `${(ratingCount / 1000).toFixed(1)}k` : ratingCount})
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 3,
  },
  countText: {
    color: COLORS.textMuted,
    marginLeft: 3,
  },
});
