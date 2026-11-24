import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
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
import { EmptyState } from '../src/components/EmptyState';
import { COLORS, RADIUS, SHADOWS } from '../src/constants/theme';
import { useCart } from '../src/context/CartContext';

export default function CartScreen() {
  const router = useRouter();
  const {
    items,
    itemCount,
    subtotal,
    deliveryFee,
    tax,
    discount,
    total,
    appliedPromo,
    restaurantName,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyPromoCode,
    removePromoCode,
  } = useCart();

  const [promoInput, setPromoInput] = useState('');
  const [promoNotice, setPromoNotice] = useState<{ text: string; error?: boolean } | null>(null);

  const handleApplyPromo = () => {
    if (!promoInput.trim()) {
      setPromoNotice({ text: 'Please enter a code (e.g. CHOWWELCOME)', error: true });
      return;
    }
    const res = applyPromoCode(promoInput.trim());
    if (res.success) {
      setPromoNotice({ text: res.message, error: false });
      setPromoInput('');
    } else {
      setPromoNotice({ text: res.message, error: true });
    }
  };

  const handleClearCart = () => {
    Alert.alert('Empty Cart', 'Are you sure you want to remove all items from your cart?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearCart },
    ]);
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer} edges={['bottom']}>
        <EmptyState
          icon="cart-outline"
          title="Your Cart is Empty"
          description="Looks like you haven't added anything to your cart yet. Explore gourmet meals and satisfy your hunger!"
          buttonTitle="Browse Restaurants"
          onButtonPress={() => router.replace('/(tabs)')}
        />
      </SafeAreaView>
    );
  }

  const freeDeliveryThreshold = 35.0;
  const awayFromFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Restaurant Header */}
        <View style={styles.restaurantHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.orderingFromLabel}>ORDERING FROM</Text>
            <Text style={styles.restaurantNameTitle}>{restaurantName}</Text>
          </View>
          <TouchableOpacity onPress={handleClearCart}>
            <Text style={styles.clearCartText}>Clear</Text>
          </TouchableOpacity>
        </View>

        {/* Free Delivery Progress */}
        <View style={styles.freeDelivCard}>
          <Ionicons
            name="bicycle"
            size={20}
            color={awayFromFreeDelivery === 0 ? COLORS.success : COLORS.secondary}
          />
          <View style={{ flex: 1, marginLeft: 10 }}>
            {awayFromFreeDelivery === 0 || appliedPromo?.code === 'FREEDEL' ? (
              <Text style={styles.freeDelivSuccess}>🎉 You qualified for FREE delivery!</Text>
            ) : (
              <Text style={styles.freeDelivPrompt}>
                Add <Text style={{ fontWeight: '800' }}>${awayFromFreeDelivery.toFixed(2)}</Text> more for free delivery
              </Text>
            )}
          </View>
        </View>

        {/* Cart Items List */}
        <View style={styles.itemsSection}>
          <Text style={styles.sectionTitle}>Your Items ({itemCount})</Text>

          {items.map((item) => (
            <View key={item.cartItemId} style={styles.itemCard}>
              <Image source={{ uri: item.food.image }} style={styles.itemImage} resizeMode="cover" />

              <View style={styles.itemDetails}>
                <View style={styles.itemTitleRow}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.food.name}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeFromCart(item.cartItemId)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                  </TouchableOpacity>
                </View>

                {item.selectedCustomizations.length > 0 && (
                  <View style={styles.customizationsWrap}>
                    {item.selectedCustomizations.map((c, i) => (
                      <Text key={i} style={styles.customizationText}>
                        + {c.choiceName} {c.price > 0 ? `($${c.price.toFixed(2)})` : ''}
                      </Text>
                    ))}
                  </View>
                )}

                {item.specialInstructions ? (
                  <Text style={styles.instructionNote} numberOfLines={1}>
                    Note: "{item.specialInstructions}"
                  </Text>
                ) : null}

                <View style={styles.itemBottomRow}>
                  <Text style={styles.itemPrice}>${item.itemTotal.toFixed(2)}</Text>

                  <View style={styles.qtyControl}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                    >
                      <Ionicons name="remove" size={14} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.qtyVal}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                    >
                      <Ionicons name="add" size={14} color={COLORS.text} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Promo Code Section */}
        <View style={styles.promoSection}>
          <Text style={styles.sectionTitle}>Promotions & Vouchers</Text>

          {appliedPromo ? (
            <View style={styles.appliedPromoBox}>
              <View style={styles.promoLeft}>
                <Ionicons name="pricetag" size={18} color={COLORS.secondary} />
                <View style={{ marginLeft: 8 }}>
                  <Text style={styles.appliedCode}>{appliedPromo.code}</Text>
                  <Text style={styles.appliedDesc}>
                    {appliedPromo.discountPercent
                      ? `${appliedPromo.discountPercent}% discount applied`
                      : `$${appliedPromo.discountAmount?.toFixed(2)} off your order`}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={removePromoCode}>
                <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <View style={styles.promoInputRow}>
                <TextInput
                  style={styles.promoInput}
                  placeholder="Enter code: CHOWWELCOME or FREEDEL"
                  placeholderTextColor={COLORS.textMuted}
                  value={promoInput}
                  onChangeText={setPromoInput}
                  autoCapitalize="characters"
                />
                <Button
                  title="Apply"
                  variant="primary"
                  size="sm"
                  onPress={handleApplyPromo}
                  style={styles.applyBtn}
                />
              </View>
              {promoNotice && (
                <Text
                  style={[
                    styles.promoNoticeText,
                    { color: promoNotice.error ? COLORS.error : COLORS.success },
                  ]}
                >
                  {promoNotice.text}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Bill Summary */}
        <View style={styles.billSection}>
          <Text style={styles.sectionTitle}>Order Summary</Text>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Subtotal</Text>
            <Text style={styles.billVal}>${subtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery Fee</Text>
            <Text style={styles.billVal}>
              {deliveryFee === 0 ? (
                <Text style={{ color: COLORS.success, fontWeight: '700' }}>FREE</Text>
              ) : (
                `$${deliveryFee.toFixed(2)}`
              )}
            </Text>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Estimated Taxes (8%)</Text>
            <Text style={styles.billVal}>${tax.toFixed(2)}</Text>
          </View>

          {discount > 0 && (
            <View style={styles.billRow}>
              <Text style={[styles.billLabel, { color: COLORS.secondary, fontWeight: '700' }]}>
                Promotion Discount
              </Text>
              <Text style={[styles.billVal, { color: COLORS.secondary, fontWeight: '800' }]}>
                -${discount.toFixed(2)}
              </Text>
            </View>
          )}

          <View style={styles.totalDivider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalVal}>${total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Checkout Action */}
      <SafeAreaView style={styles.bottomBar} edges={['bottom']}>
        <View style={styles.checkoutPriceColumn}>
          <Text style={styles.bottomTotalLabel}>Total to Pay</Text>
          <Text style={styles.bottomTotalVal}>${total.toFixed(2)}</Text>
        </View>

        <Button
          title="Proceed to Checkout"
          variant="primary"
          size="lg"
          icon={<Ionicons name="arrow-forward" size={18} color={COLORS.white} />}
          iconPosition="right"
          onPress={() => router.push('/checkout')}
          style={{ flex: 1, marginLeft: 16 }}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  restaurantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  orderingFromLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  restaurantNameTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 2,
  },
  clearCartText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.error,
  },
  freeDelivCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondaryLight,
    padding: 12,
    borderRadius: RADIUS.md,
    marginBottom: 14,
  },
  freeDelivPrompt: {
    fontSize: 12,
    color: COLORS.secondaryDark,
  },
  freeDelivSuccess: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.success,
  },
  itemsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 10,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  itemImage: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.md,
    backgroundColor: '#EAEAEA',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  itemTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  customizationsWrap: {
    marginTop: 3,
  },
  customizationText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  instructionNote: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    marginTop: 2,
  },
  itemBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F3',
    borderRadius: RADIUS.full,
    padding: 3,
  },
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  qtyVal: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
    paddingHorizontal: 8,
  },
  promoSection: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    ...SHADOWS.sm,
  },
  appliedPromoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.secondaryLight,
    padding: 10,
    borderRadius: RADIUS.md,
  },
  promoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appliedCode: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.secondaryDark,
  },
  appliedDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  promoInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoInput: {
    flex: 1,
    height: 44,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    fontSize: 13,
    backgroundColor: '#FAF9F6',
    color: COLORS.text,
  },
  applyBtn: {
    marginLeft: 8,
  },
  promoNoticeText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  billSection: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  billLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  billVal: {
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
  totalVal: {
    fontSize: 20,
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...SHADOWS.lg,
  },
  checkoutPriceColumn: {
    justifyContent: 'center',
  },
  bottomTotalLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  bottomTotalVal: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primary,
  },
});
