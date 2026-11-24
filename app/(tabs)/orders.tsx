import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge } from '../../src/components/Badge';
import { BottomCartBar } from '../../src/components/BottomCartBar';
import { Button } from '../../src/components/Button';
import { EmptyState } from '../../src/components/EmptyState';
import { COLORS, RADIUS, SHADOWS } from '../../src/constants/theme';
import { useCart } from '../../src/context/CartContext';
import { useOrders } from '../../src/context/OrderContext';
import { Order, OrderStatus } from '../../src/types';

export default function OrdersScreen() {
  const router = useRouter();
  const { orders, advanceOrderStatus } = useOrders();
  const { addToCart } = useCart();
  const [refreshing, setRefreshing] = useState(false);

  const activeOrders = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled');
  const pastOrders = orders.filter((o) => o.status === 'delivered' || o.status === 'cancelled');

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'placed':
        return <Badge label="Order Placed" variant="primary" size="sm" />;
      case 'confirmed':
        return <Badge label="Kitchen Confirmed" variant="secondary" size="sm" />;
      case 'preparing':
        return <Badge label="Cooking Meal 🔥" variant="warning" size="sm" />;
      case 'picked_up':
        return <Badge label="On The Way 🛵" variant="secondary" size="sm" />;
      case 'delivered':
        return <Badge label="Delivered" variant="success" size="sm" />;
      case 'cancelled':
        return <Badge label="Cancelled" variant="error" size="sm" />;
    }
  };

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      addToCart(item.food, item.quantity, item.selectedCustomizations, item.specialInstructions);
    });
    router.push('/cart');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <Text style={styles.headerSubtitle}>Track live orders and view purchase history</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Active Orders Section */}
        {activeOrders.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.liveIndicatorRow}>
                <View style={styles.pulseDot} />
                <Text style={styles.sectionTitle}>Active Orders</Text>
              </View>
              <Text style={styles.activeCount}>{activeOrders.length} in progress</Text>
            </View>

            {activeOrders.map((order) => (
              <View key={order.id} style={styles.activeOrderCard}>
                <View style={styles.cardTopRow}>
                  <Image source={{ uri: order.restaurantImage }} style={styles.restThumb} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.restName} numberOfLines={1}>
                      {order.restaurantName}
                    </Text>
                    <Text style={styles.orderNumberText}>
                      Order #{order.orderNumber} • {order.items.length} items
                    </Text>
                    <View style={{ marginTop: 4 }}>{getStatusBadge(order.status)}</View>
                  </View>
                  <Text style={styles.orderTotal}>${order.total.toFixed(2)}</Text>
                </View>

                {/* Progress Mini Bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width:
                            order.status === 'placed'
                              ? '20%'
                              : order.status === 'confirmed'
                              ? '40%'
                              : order.status === 'preparing'
                              ? '65%'
                              : order.status === 'picked_up'
                              ? '88%'
                              : '100%',
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.etaRow}>
                    <Text style={styles.etaLabel}>Estimated Delivery</Text>
                    <Text style={styles.etaValue}>{order.estimatedDeliveryTime}</Text>
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.activeActionsRow}>
                  <Button
                    title="Track Live"
                    variant="primary"
                    size="sm"
                    icon={<Ionicons name="location" size={14} color={COLORS.white} />}
                    onPress={() => router.push(`/order-tracking/${order.id}`)}
                    style={{ flex: 1, marginRight: 8 }}
                  />
                  <Button
                    title="Advance Status"
                    variant="outline"
                    size="sm"
                    onPress={() => advanceOrderStatus(order.id)}
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Past Orders Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Past Orders</Text>

          {pastOrders.length === 0 && activeOrders.length === 0 ? (
            <EmptyState
              icon="receipt-outline"
              title="No Orders Yet"
              description="Your order history will appear here once you place your first delicious meal."
              buttonTitle="Explore Food"
              onButtonPress={() => router.push('/(tabs)/explore')}
              style={{ marginTop: 20 }}
            />
          ) : (
            pastOrders.map((order) => {
              const dateFormatted = new Date(order.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <View key={order.id} style={styles.pastOrderCard}>
                  <View style={styles.cardTopRow}>
                    <Image source={{ uri: order.restaurantImage }} style={styles.restThumb} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.restName} numberOfLines={1}>
                        {order.restaurantName}
                      </Text>
                      <Text style={styles.orderNumberText}>{dateFormatted}</Text>
                      <View style={{ marginTop: 4 }}>{getStatusBadge(order.status)}</View>
                    </View>
                    <Text style={styles.orderTotal}>${order.total.toFixed(2)}</Text>
                  </View>

                  {/* Items summary */}
                  <View style={styles.itemsSummary}>
                    {order.items.map((it, idx) => (
                      <Text key={idx} style={styles.summaryItemText} numberOfLines={1}>
                        {it.quantity}x {it.food.name}
                      </Text>
                    ))}
                  </View>

                  <View style={styles.pastActionsRow}>
                    <Button
                      title="View Receipt & Timeline"
                      variant="ghost"
                      size="sm"
                      onPress={() => router.push(`/order-tracking/${order.id}`)}
                      textStyle={{ color: COLORS.primary, fontSize: 13 }}
                    />
                    <Button
                      title="Reorder"
                      variant="secondary"
                      size="sm"
                      icon={<Ionicons name="repeat" size={14} color={COLORS.white} />}
                      onPress={() => handleReorder(order)}
                    />
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      <BottomCartBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
  section: {
    marginTop: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  liveIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.secondary,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  activeCount: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  activeOrderCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: COLORS.primaryLight,
    ...SHADOWS.md,
  },
  pastOrderCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  restThumb: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.md,
    backgroundColor: '#EAEAEA',
  },
  restName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  orderNumberText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  progressContainer: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  progressTrack: {
    height: 6,
    backgroundColor: COLORS.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  etaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  etaLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  etaValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  activeActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  itemsSummary: {
    marginTop: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  summaryItemText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginVertical: 2,
  },
  pastActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 8,
  },
});
