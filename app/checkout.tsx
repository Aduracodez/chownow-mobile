import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge } from '../src/components/Badge';
import { Button } from '../src/components/Button';
import { COLORS, RADIUS, SHADOWS } from '../src/constants/theme';
import { useAuth } from '../src/context/AuthContext';
import { useCart } from '../src/context/CartContext';
import { useOrders } from '../src/context/OrderContext';
import { RESTAURANTS } from '../src/data/restaurants';
import { DeliveryAddress } from '../src/types';

export default function CheckoutScreen() {
  const router = useRouter();
  const { user, addresses, selectedAddress, setSelectedAddress } = useAuth();
  const { items, subtotal, deliveryFee, tax, discount, total, appliedPromo, restaurantId, restaurantName, clearCart } = useCart();
  const { placeOrder } = useOrders();

  const [contactPhone, setContactPhone] = useState(user?.phone || '+1 (555) 349-2819');
  const [deliveryNotes, setDeliveryNotes] = useState('Ring bell 4B or leave at door concierge.');
  const [paymentMethod, setPaymentMethod] = useState<'apple_pay' | 'card' | 'cash' | 'wallet'>('apple_pay');
  const [isPlacing, setIsPlacing] = useState(false);
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);

  // Address to use
  const activeAddress: DeliveryAddress = selectedAddress || addresses[0] || {
    id: 'addr-fallback',
    label: 'Home',
    street: '142 Palm Boulevard, Apt 4B',
    city: 'Metropolis',
    apartment: 'Floor 4',
    isDefault: true,
  };

  const handlePlaceOrder = async () => {
    if (!contactPhone.trim()) {
      Alert.alert('Phone Required', 'Please enter a contact phone number for the rider.');
      return;
    }

    if (items.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty.');
      router.replace('/(tabs)');
      return;
    }

    setIsPlacing(true);

    // Process order authorization
    setTimeout(async () => {
      try {
        const restaurantObj = RESTAURANTS.find((r) => r.id === restaurantId);
        const order = await placeOrder({
          items,
          restaurantId: restaurantId || 'rest-1',
          restaurantName: restaurantName || 'The African Pot',
          restaurantImage:
            restaurantObj?.coverImage ||
            'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=600&q=80',
          subtotal,
          deliveryFee,
          tax,
          discount,
          total,
          promoCode: appliedPromo?.code,
          deliveryAddress: activeAddress,
          contactPhone: contactPhone.trim(),
          deliveryInstructions: deliveryNotes.trim(),
          paymentMethod,
        });

        // Clear cart after successful placement
        clearCart();
        setIsPlacing(false);

        // Navigate to Order Tracking with replacement so back doesn't re-enter checkout
        router.replace(`/order-tracking/${order.id}`);
      } catch (e) {
        setIsPlacing(false);
        Alert.alert('Error', 'Failed to place order. Please try again.');
      }
    }, 1200);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Delivery Address Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="location" size={18} color={COLORS.secondary} />
              <Text style={styles.cardTitle}>Delivery Address</Text>
            </View>
            <TouchableOpacity onPress={() => setIsAddressModalVisible(true)}>
              <Text style={styles.changeActionText}>Change</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.addressDisplayBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.addressLabel}>{activeAddress.label}</Text>
              {activeAddress.isDefault && (
                <Badge label="Default" variant="primary" size="sm" style={{ marginLeft: 6 }} />
              )}
            </View>
            <Text style={styles.addressStreet}>{activeAddress.street}</Text>
            {activeAddress.apartment ? (
              <Text style={styles.addressApartment}>{activeAddress.apartment}</Text>
            ) : null}
          </View>
        </View>

        {/* Contact Information & Rider Notes */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="call" size={18} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Contact & Delivery Instructions</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Phone Number for Delivery Updates</Text>
            <TextInput
              style={styles.input}
              value={contactPhone}
              onChangeText={setContactPhone}
              keyboardType="phone-pad"
              placeholder="+1 (555) 000-0000"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Rider Instructions (Drop-off details)</Text>
            <TextInput
              style={[styles.input, { height: 60, textAlignVertical: 'top', paddingTop: 8 }]}
              value={deliveryNotes}
              onChangeText={setDeliveryNotes}
              multiline
              numberOfLines={2}
              placeholder="e.g. Leave with security, ring apartment doorbell..."
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
        </View>

        {/* Payment Method Selector */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="card" size={18} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Payment Method</Text>
            </View>
            <Badge label="Secure Checkout" variant="success" size="sm" />
          </View>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'apple_pay' && styles.paymentOptionSelected,
            ]}
            onPress={() => setPaymentMethod('apple_pay')}
          >
            <View style={styles.payLeft}>
              <Ionicons name="logo-apple" size={20} color={COLORS.text} />
              <Text style={styles.payName}>Apple Pay</Text>
            </View>
            <View
              style={[
                styles.radioCircle,
                paymentMethod === 'apple_pay' && styles.radioCircleSelected,
              ]}
            >
              {paymentMethod === 'apple_pay' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'card' && styles.paymentOptionSelected,
            ]}
            onPress={() => setPaymentMethod('card')}
          >
            <View style={styles.payLeft}>
              <Ionicons name="card-outline" size={20} color={COLORS.primary} />
              <Text style={styles.payName}>Credit / Debit Card (•••• 4242)</Text>
            </View>
            <View
              style={[
                styles.radioCircle,
                paymentMethod === 'card' && styles.radioCircleSelected,
              ]}
            >
              {paymentMethod === 'card' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'wallet' && styles.paymentOptionSelected,
            ]}
            onPress={() => setPaymentMethod('wallet')}
          >
            <View style={styles.payLeft}>
              <Ionicons name="wallet-outline" size={20} color={COLORS.primary} />
              <Text style={styles.payName}>ChowNow Cash (${(user?.walletBalance ?? 45.0).toFixed(2)})</Text>
            </View>
            <View
              style={[
                styles.radioCircle,
                paymentMethod === 'wallet' && styles.radioCircleSelected,
              ]}
            >
              {paymentMethod === 'wallet' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'cash' && styles.paymentOptionSelected,
            ]}
            onPress={() => setPaymentMethod('cash')}
          >
            <View style={styles.payLeft}>
              <Ionicons name="cash-outline" size={20} color={COLORS.success} />
              <Text style={styles.payName}>Cash on Delivery</Text>
            </View>
            <View
              style={[
                styles.radioCircle,
                paymentMethod === 'cash' && styles.radioCircleSelected,
              ]}
            >
              {paymentMethod === 'cash' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        </View>

        {/* Order Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Final Order Breakdown</Text>

          <View style={styles.summaryItemRow}>
            <Text style={styles.summaryLabel}>Subtotal ({items.length} items)</Text>
            <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryItemRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>
              {deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
            </Text>
          </View>

          <View style={styles.summaryItemRow}>
            <Text style={styles.summaryLabel}>Estimated Taxes (8%)</Text>
            <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
          </View>

          {discount > 0 && (
            <View style={styles.summaryItemRow}>
              <Text style={[styles.summaryLabel, { color: COLORS.secondary, fontWeight: '700' }]}>
                Promotion ({appliedPromo?.code})
              </Text>
              <Text style={[styles.summaryValue, { color: COLORS.secondary, fontWeight: '800' }]}>
                -${discount.toFixed(2)}
              </Text>
            </View>
          )}

          <View style={styles.totalDivider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Due</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Sticky Bottom Action */}
      <SafeAreaView style={styles.bottomBar} edges={['bottom']}>
        <Button
          title={isPlacing ? 'Processing Order...' : `Place Order • $${total.toFixed(2)}`}
          variant="primary"
          size="lg"
          loading={isPlacing}
          icon={<Ionicons name="lock-closed" size={16} color={COLORS.white} />}
          onPress={handlePlaceOrder}
          style={{ width: '100%' }}
        />
      </SafeAreaView>

      {/* Address Switcher Modal */}
      <Modal visible={isAddressModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Delivery Address</Text>
              <TouchableOpacity onPress={() => setIsAddressModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {addresses.map((addr) => {
              const isSelected = activeAddress.id === addr.id;
              return (
                <TouchableOpacity
                  key={addr.id}
                  onPress={() => {
                    setSelectedAddress(addr);
                    setIsAddressModalVisible(false);
                  }}
                  style={[
                    styles.addressModalItem,
                    isSelected && styles.addressModalItemSelected,
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.addrModalLabel}>{addr.label}</Text>
                    <Text style={styles.addrModalStreet}>{addr.street}</Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    marginLeft: 6,
  },
  changeActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  addressDisplayBox: {
    backgroundColor: '#FAF9F6',
    padding: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  addressStreet: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  addressApartment: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  inputGroup: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    fontSize: 13,
    color: COLORS.text,
    backgroundColor: '#FAF9F6',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
  },
  paymentOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  payLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 10,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  summaryItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  totalDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...SHADOWS.lg,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  addressModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  addressModalItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  addrModalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  addrModalStreet: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
