import { Ionicons } from '@expo/vector-icons';
import { Link, Stack } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../src/components/Button';
import { COLORS } from '../src/constants/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Page Not Found' }} />
      <View style={styles.container}>
        <Ionicons name="restaurant-outline" size={64} color={COLORS.primary} style={{ marginBottom: 16 }} />
        <Text style={styles.title}>Dish or Screen Not Found</Text>
        <Text style={styles.desc}>This culinary destination seems to have wandered off the menu.</Text>

        <Link href="/(tabs)" asChild>
          <Button title="Return to ChowNow Home" variant="primary" size="lg" style={{ marginTop: 24 }} onPress={() => {}} />
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  desc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 280,
  },
});
