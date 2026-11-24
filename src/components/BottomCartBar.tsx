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
import { useCart } from '../context/CartContext';

export const BottomCartBar: React.FC = () => {
  const router = useRouter();
  const { itemCount, subtotal, restaurantName } = useCart();

  if (itemCount === 0) return null;

  return (
    <View style={styles.outerContainer}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push('/cart')}
        style={styles.innerBar}
      >
        <View style={styles.leftInfo}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{itemCount}</Text>
          </View>
          <View style={styles.textColumn}>
            <Text style={styles.viewCartText}>View Cart</Text>
            {restaurantName ? (
              <Text style={styles.restaurantName} numberOfLines={1}>
                {restaurantName}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.rightInfo}>
          <Text style={styles.totalText}>${subtotal.toFixed(2)}</Text>
          <Ionicons name="arrow-forward" size={18} color={COLORS.white} style={{ marginLeft: 6 }} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: 84, // elevated nicely above bottom tabs
    left: 16,
    right: 16,
    zIndex: 100,
  },
  innerBar: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SHADOWS.xl,
  },
  leftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  badgeText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 13,
  },
  textColumn: {
    flex: 1,
  },
  viewCartText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  restaurantName: {
    color: '#D4E8DD',
    fontSize: 11,
  },
  rightInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
  },
});
