import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Dimensions,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';
import { Promotion } from '../types';

interface PromoBannerProps {
  promo: Promotion;
  onPress: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - 32;

export const PromoBanner: React.FC<PromoBannerProps> = ({ promo, onPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.container, { backgroundColor: promo.bgColor }]}
    >
      <ImageBackground
        source={{ uri: promo.imageUrl }}
        style={styles.imageBackground}
        imageStyle={styles.imageStyle}
      >
        <View style={styles.overlay} />

        <View style={styles.content}>
          <View style={styles.badgeWrapper}>
            <Text style={styles.badgeText}>{promo.badge}</Text>
          </View>

          <Text style={styles.title} numberOfLines={2}>
            {promo.title}
          </Text>

          <Text style={styles.subtitle} numberOfLines={1}>
            {promo.subtitle}
          </Text>

          <View style={styles.codeRow}>
            <View style={styles.codePill}>
              <Ionicons name="pricetag" size={12} color={COLORS.secondary} />
              <Text style={styles.codeText}>{promo.code}</Text>
            </View>
            <Text style={styles.claimText}>Tap to use →</Text>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: BANNER_WIDTH,
    height: 160,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    marginRight: 16,
    ...SHADOWS.md,
  },
  imageBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  imageStyle: {
    borderRadius: RADIUS.xl,
    opacity: 0.85,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(22, 75, 53, 0.65)',
  },
  content: {
    padding: 16,
    justifyContent: 'space-between',
    height: '100%',
  },
  badgeWrapper: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.secondary,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: RADIUS.full,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 24,
  },
  subtitle: {
    color: '#E0E7E3',
    fontSize: 12,
    marginTop: 2,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  codePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: RADIUS.sm,
  },
  codeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  claimText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
});
