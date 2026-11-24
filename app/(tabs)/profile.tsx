import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge } from '../../src/components/Badge';
import { BottomCartBar } from '../../src/components/BottomCartBar';
import { Button } from '../../src/components/Button';
import { COLORS, RADIUS, SHADOWS } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';
import { useOrders } from '../../src/context/OrderContext';
import { SupabaseService } from '../../src/services/supabase';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, addresses, addAddress, logout } = useAuth();
  const { orders } = useOrders();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [promoAlertsEnabled, setPromoAlertsEnabled] = useState(true);

  // Address modal
  const [isAddAddressVisible, setIsAddAddressVisible] = useState(false);
  const [newLabel, setNewLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [newStreet, setNewStreet] = useState('');
  const [newApartment, setNewApartment] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Architecture info modal
  const [isArchModalVisible, setIsArchModalVisible] = useState(false);

  // Help modal
  const [isHelpVisible, setIsHelpVisible] = useState(false);

  const handleCreateAddress = () => {
    if (!newStreet.trim()) {
      Alert.alert('Required Field', 'Please enter your street address.');
      return;
    }
    addAddress({
      label: newLabel,
      street: newStreet.trim(),
      city: 'Metropolis',
      apartment: newApartment.trim(),
      deliveryNotes: newNotes.trim(),
      isDefault: false,
    });
    setNewStreet('');
    setNewApartment('');
    setNewNotes('');
    setIsAddAddressVisible(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image
            source={{
              uri:
                user?.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{user?.fullName || 'Guest Customer'}</Text>
              {user?.isGuest ? (
                <Badge label="Guest Mode" variant="warning" size="sm" style={{ marginLeft: 6 }} />
              ) : (
                <Badge label="Premium" variant="secondary" size="sm" style={{ marginLeft: 6 }} />
              )}
            </View>
            <Text style={styles.userEmail}>{user?.email || 'guest@chownow.app'}</Text>
            <Text style={styles.userPhone}>{user?.phone || '+1 (555) 349-2819'}</Text>
          </View>
        </View>

        {/* ChowNow Wallet Card */}
        <View style={styles.walletCard}>
          <View style={styles.walletHeader}>
            <View style={styles.walletIconWrap}>
              <Ionicons name="wallet-outline" size={20} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.walletLabel}>ChowNow Cash Balance</Text>
              <Text style={styles.walletBalance}>${(user?.walletBalance ?? 45.0).toFixed(2)}</Text>
            </View>
            <Button
              title="+ Add Funds"
              size="sm"
              variant="outline"
              onPress={() => Alert.alert('ChowNow Cash', '$25 has been credited to your balance.')}
            />
          </View>
        </View>

        {/* Cloud Architecture & Services */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => setIsArchModalVisible(true)}
          style={styles.archBanner}
        >
          <View style={styles.archIconWrap}>
            <Ionicons name="cloud-done-outline" size={20} color={COLORS.white} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.archTitle}>Cloud Services & Sync</Text>
              <Badge
                label="Online"
                variant="success"
                size="sm"
                style={{ marginLeft: 6 }}
              />
            </View>
            <Text style={styles.archSubtitle}>
              Realtime order dispatch, driver coordination & cloud storage
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* Saved Addresses Section */}
        <View style={styles.menuGroup}>
          <View style={styles.menuGroupHeader}>
            <Text style={styles.groupTitle}>Saved Delivery Addresses</Text>
            <TouchableOpacity onPress={() => setIsAddAddressVisible(true)}>
              <Text style={styles.addAddressLink}>+ Add New</Text>
            </TouchableOpacity>
          </View>

          {addresses.map((addr) => (
            <View key={addr.id} style={styles.addressItem}>
              <View style={styles.addressIconCircle}>
                <Ionicons
                  name={addr.label === 'Work' ? 'briefcase' : 'home'}
                  size={16}
                  color={COLORS.primary}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.addrLabel}>{addr.label}</Text>
                  {addr.isDefault && (
                    <Badge label="Default" variant="primary" size="sm" style={{ marginLeft: 6 }} />
                  )}
                </View>
                <Text style={styles.addrStreet}>{addr.street}</Text>
                {addr.apartment ? <Text style={styles.addrNotes}>{addr.apartment}</Text> : null}
              </View>
            </View>
          ))}
        </View>

        {/* Preferences & Quick Links */}
        <View style={styles.menuGroup}>
          <Text style={styles.groupTitle}>Account & Settings</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/(tabs)/orders')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="receipt-outline" size={20} color={COLORS.primary} />
              <Text style={styles.menuItemText}>Order History</Text>
            </View>
            <View style={styles.menuItemRight}>
              <Text style={styles.metaCount}>{orders.length} orders</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/(tabs)/favourites')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="heart-outline" size={20} color={COLORS.primary} />
              <Text style={styles.menuItemText}>Favourites & Wishlist</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="notifications-outline" size={20} color={COLORS.primary} />
              <Text style={styles.menuItemText}>Order Status Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#D1D5DB', true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>

          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="pricetag-outline" size={20} color={COLORS.primary} />
              <Text style={styles.menuItemText}>Special Offers & Promo Alerts</Text>
            </View>
            <Switch
              value={promoAlertsEnabled}
              onValueChange={setPromoAlertsEnabled}
              trackColor={{ false: '#D1D5DB', true: COLORS.secondary }}
              thumbColor={COLORS.white}
            />
          </View>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setIsHelpVisible(true)}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="help-circle-outline" size={20} color={COLORS.primary} />
              <Text style={styles.menuItemText}>Help, FAQs & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Quick App Links */}
        <View style={styles.menuGroup}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/onboarding')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="compass-outline" size={20} color={COLORS.secondary} />
              <Text style={styles.menuItemText}>App Feature Walkthrough</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/splash')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="sparkles-outline" size={20} color={COLORS.secondary} />
              <Text style={styles.menuItemText}>ChowNow Welcome Splash</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Authentication Controls */}
        <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
          {user?.isGuest ? (
            <Button
              title="Sign Up / Sign In to Save Profile"
              variant="primary"
              size="lg"
              onPress={() => router.push('/auth/login')}
            />
          ) : (
            <Button
              title="Sign Out"
              variant="outline"
              size="lg"
              icon={<Ionicons name="log-out-outline" size={18} color={COLORS.error} />}
              textStyle={{ color: COLORS.error }}
              style={{ borderColor: COLORS.error }}
              onPress={handleLogout}
            />
          )}
        </View>

        <Text style={styles.versionText}>ChowNow Mobile v1.0.0 • React Native & Expo</Text>
      </ScrollView>

      {/* Add Address Modal */}
      <Modal visible={isAddAddressVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Delivery Address</Text>
              <TouchableOpacity onPress={() => setIsAddAddressVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {/* Label Selector */}
            <View style={styles.labelTabs}>
              {(['Home', 'Work', 'Other'] as const).map((lbl) => (
                <TouchableOpacity
                  key={lbl}
                  onPress={() => setNewLabel(lbl)}
                  style={[styles.labelTabBtn, newLabel === lbl && styles.labelTabBtnActive]}
                >
                  <Text style={[styles.labelTabText, newLabel === lbl && styles.labelTabTextActive]}>
                    {lbl}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Street address (e.g. 142 Palm Boulevard)"
              placeholderTextColor={COLORS.textMuted}
              value={newStreet}
              onChangeText={setNewStreet}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Apartment, suite or unit (optional)"
              placeholderTextColor={COLORS.textMuted}
              value={newApartment}
              onChangeText={setNewApartment}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Delivery instructions (e.g. gate code)"
              placeholderTextColor={COLORS.textMuted}
              value={newNotes}
              onChangeText={setNewNotes}
            />

            <Button
              title="Save Address"
              variant="primary"
              size="lg"
              onPress={handleCreateAddress}
              style={{ marginTop: 14 }}
            />
          </View>
        </View>
      </Modal>

      {/* Backend Architecture Readiness Modal */}
      <Modal visible={isArchModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { maxHeight: '85%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Architecture & Future Roadmap</Text>
              <TouchableOpacity onPress={() => setIsArchModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.archIntro}>
                ChowNow is built with clean service abstractions and modular entities ready to scale
                into a multi-sided ecosystem:
              </Text>

              <View style={styles.archFeatureBox}>
                <Ionicons name="restaurant" size={20} color={COLORS.primary} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.archFeatureTitle}>Restaurant Owner Dashboard</Text>
                  <Text style={styles.archFeatureDesc}>
                    Schema prepared with menu item CRUD, opening hours, live order confirmation socket,
                    and order preparation pipeline.
                  </Text>
                </View>
              </View>

              <View style={styles.archFeatureBox}>
                <Ionicons name="bicycle" size={20} color={COLORS.secondary} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.archFeatureTitle}>Delivery Driver Interface</Text>
                  <Text style={styles.archFeatureDesc}>
                    Live GPS polling coordinates, accepted dispatch jobs, pickup verification, and
                    driver tip calculations.
                  </Text>
                </View>
              </View>

              <View style={styles.archFeatureBox}>
                <Ionicons name="card" size={20} color={COLORS.primary} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.archFeatureTitle}>Payment Gateway & Security</Text>
                  <Text style={styles.archFeatureDesc}>
                    Tokenized card authorizations, Apple Pay native integration, and secure checkout
                    processing.
                  </Text>
                </View>
              </View>

              <View style={styles.archFeatureBox}>
                <Ionicons name="cloud-done" size={20} color={COLORS.success} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.archFeatureTitle}>Database & Cloud Sync</Text>
                  <Text style={styles.archFeatureDesc}>
                    PostgreSQL backend powered by Supabase with client-side offline replication.
                  </Text>
                </View>
              </View>

              <Button
                title="Close"
                variant="primary"
                onPress={() => setIsArchModalVisible(false)}
                style={{ marginTop: 16, marginBottom: 10 }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Help & Support Modal */}
      <Modal visible={isHelpVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { maxHeight: '80%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Frequently Asked Questions</Text>
              <TouchableOpacity onPress={() => setIsHelpVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.faqItem}>
                <Text style={styles.faqQ}>How does live order tracking work?</Text>
                <Text style={styles.faqA}>
                  Once an order is confirmed, the kitchen updates its preparation stage. You will see
                  live delivery milestones from cooking to driver pickup until arrival at your door.
                </Text>
              </View>

              <View style={styles.faqItem}>
                <Text style={styles.faqQ}>What promo codes can I apply?</Text>
                <Text style={styles.faqA}>
                  First-time customers can apply code CHOWWELCOME for 30% off orders over $25, or FREEDEL
                  for free delivery.
                </Text>
              </View>

              <View style={styles.faqItem}>
                <Text style={styles.faqQ}>Are my cart and favorites saved automatically?</Text>
                <Text style={styles.faqA}>
                  Yes, your cart items, customized toppings, and saved restaurants are automatically
                  persisted on your device.
                </Text>
              </View>

              <Button
                title="Close"
                variant="primary"
                onPress={() => setIsHelpVisible(false)}
                style={{ marginTop: 16 }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      <BottomCartBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 18,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EAEAEA',
  },
  profileInfo: {
    marginLeft: 14,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  userEmail: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  userPhone: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  walletCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    ...SHADOWS.sm,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  walletBalance: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  archBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 14,
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  archIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  archTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  archSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  menuGroup: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  menuGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addAddressLink: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  addressIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addrLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  addrStreet: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  addrNotes: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
    marginLeft: 12,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaCount: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginRight: 6,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 24,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  labelTabs: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  labelTabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: RADIUS.sm,
    backgroundColor: '#F3F4F6',
    marginRight: 6,
  },
  labelTabBtnActive: {
    backgroundColor: COLORS.primary,
  },
  labelTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  labelTabTextActive: {
    color: COLORS.white,
  },
  modalInput: {
    height: 48,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    marginBottom: 12,
    fontSize: 14,
    color: COLORS.text,
  },
  archIntro: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  archFeatureBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAF9',
    padding: 12,
    borderRadius: RADIUS.md,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  archFeatureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  archFeatureDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginTop: 2,
  },
  faqItem: {
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  faqQ: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  faqA: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});
