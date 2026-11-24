import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface HeaderProps {
  onAddressPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onAddressPress }) => {
  const router = useRouter();
  const { selectedAddress } = useAuth();
  const { itemCount } = useCart();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onAddressPress || (() => router.push('/(tabs)/profile'))}
        style={styles.addressContainer}
      >
        <View style={styles.locationIconWrap}>
          <Ionicons name="location" size={18} color={COLORS.secondary} />
        </View>
        <View style={styles.textWrap}>
          <View style={styles.row}>
            <Text style={styles.deliveryTo}>DELIVER TO</Text>
            <Ionicons name="chevron-down" size={14} color={COLORS.textSecondary} style={{ marginLeft: 2 }} />
          </View>
          <Text style={styles.addressText} numberOfLines={1}>
            {selectedAddress?.street || 'Select delivery location'}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/cart')}
          style={styles.actionBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="cart-outline" size={24} color={COLORS.primary} />
          {itemCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {itemCount > 99 ? '99+' : itemCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.background,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  locationIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  textWrap: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryTo: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  addressText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
    ...SHADOWS.sm,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.secondary,
    borderRadius: RADIUS.full,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: COLORS.surface,
  },
  cartBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '800',
  },
});
