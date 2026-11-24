import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '../../src/components/Button';
import { COLORS, RADIUS, SHADOWS } from '../../src/constants/theme';
import { SupabaseService } from '../../src/services/supabase';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleReset = async () => {
    setErrorMsg(null);
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    await SupabaseService.resetPassword(email.trim());
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="key-outline" size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Enter your email and we'll send password reset instructions
          </Text>
        </View>

        {submitted ? (
          <View style={styles.successBox}>
            <Ionicons name="checkmark-circle" size={48} color={COLORS.success} />
            <Text style={styles.successTitle}>Check Your Inbox</Text>
            <Text style={styles.successDesc}>
              We have dispatched a password recovery link to {email}. Follow the instructions to reset your password.
            </Text>
            <Button
              title="Back to Sign In"
              variant="primary"
              size="lg"
              onPress={() => router.replace('/auth/login')}
              style={{ marginTop: 20, width: '100%' }}
            />
          </View>
        ) : (
          <View style={styles.form}>
            {errorMsg && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={COLORS.error} />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Account Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={18} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.input}
                  placeholder="you@domain.com"
                  placeholderTextColor={COLORS.textMuted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <Button
              title="Send Reset Link"
              variant="primary"
              size="lg"
              loading={loading}
              onPress={handleReset}
              style={{ marginTop: 8 }}
            />

            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginTop: 16, alignItems: 'center' }}
            >
              <Text style={styles.backLink}>Cancel & Return to Login</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 24,
    justifyContent: 'center',
    minHeight: '90%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 280,
  },
  form: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: '#FBFBFB',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.errorLight,
    padding: 12,
    borderRadius: RADIUS.md,
    marginBottom: 14,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  successBox: {
    backgroundColor: COLORS.surface,
    padding: 28,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 6,
  },
  successDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  backLink: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
