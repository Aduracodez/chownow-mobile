import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge } from '../src/components/Badge';
import { Button } from '../src/components/Button';
import { COLORS, RADIUS, SHADOWS } from '../src/constants/theme';

export default function ModalScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.logoWrap}>
        <Ionicons name="restaurant" size={36} color={COLORS.secondary} />
      </View>

      <Text style={styles.title}>ChowNow</Text>
      <Text style={styles.subtitle}>Version 1.0.0 (Build 100)</Text>

      <View style={styles.badgeRow}>
        <Badge label="Premium Delivery" variant="primary" size="md" />
        <Badge label="Live Order Sync" variant="secondary" size="md" style={{ marginLeft: 6 }} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardHeading}>About ChowNow</Text>
        <Text style={styles.bodyText}>
          ChowNow delivers culinary excellence directly to your door. From artisanal woodfired
          pizzas and gourmet smashed burgers to West African party jollof, fresh Atlantic seafood,
          and handcrafted drinks, every meal is prepared by top-rated partner kitchens.
        </Text>
        <View style={styles.divider} />
        <Text style={styles.copyrightText}>
          © 2026 ChowNow Inc. All rights reserved.{'\n'}
          Designed and engineered with React Native & Expo.
        </Text>
      </View>

      <Button
        title="Close"
        variant="primary"
        size="lg"
        onPress={() => router.back()}
        style={{ marginTop: 24, width: '100%' }}
      />

      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    alignItems: 'center',
    padding: 24,
    paddingTop: 36,
  },
  logoWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 12,
    marginBottom: 20,
  },
  card: {
    backgroundColor: COLORS.surface,
    padding: 18,
    borderRadius: RADIUS.lg,
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 14,
  },
  copyrightText: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
});
