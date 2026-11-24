import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from '../src/components/Button';
import { COLORS, RADIUS } from '../src/constants/theme';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logoBadge}>
          <Ionicons name="restaurant" size={48} color={COLORS.secondary} />
        </View>

        <Text style={styles.brandTitle}>
          Chow<Text style={styles.brandAccent}>Now</Text>
        </Text>
        <Text style={styles.tagline}>Premium Culinary Delights, Delivered Fast</Text>

        <View style={styles.featuresRow}>
          <View style={styles.featureItem}>
            <Ionicons name="sparkles" size={16} color={COLORS.secondary} />
            <Text style={styles.featureText}>Gourmet Quality</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="bicycle" size={16} color={COLORS.secondary} />
            <Text style={styles.featureText}>Under 30 Mins</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="shield-checkmark" size={16} color={COLORS.secondary} />
            <Text style={styles.featureText}>Live Tracking</Text>
          </View>
        </View>
      </Animated.View>

      <View style={styles.bottomButtons}>
        <Button
          title="Get Started"
          variant="secondary"
          size="lg"
          onPress={() => router.replace('/onboarding')}
          style={{ marginBottom: 12 }}
        />
        <Button
          title="Explore App Directly"
          variant="outline"
          size="md"
          textStyle={{ color: COLORS.white }}
          style={{ borderColor: 'rgba(255,255,255,0.4)' }}
          onPress={() => router.replace('/(tabs)')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: 'space-between',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBadge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 145, 77, 0.4)',
  },
  brandTitle: {
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: -1,
  },
  brandAccent: {
    color: COLORS.secondary,
  },
  tagline: {
    fontSize: 14,
    color: '#D4E8DD',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 260,
    lineHeight: 20,
  },
  featuresRow: {
    flexDirection: 'row',
    marginTop: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: RADIUS.full,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  featureText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  bottomButtons: {
    width: '100%',
  },
});
