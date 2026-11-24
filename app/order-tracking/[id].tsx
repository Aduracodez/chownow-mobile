import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import { COLORS, RADIUS, SHADOWS } from '../../src/constants/theme';
import { useOrders } from '../../src/context/OrderContext';
import { OrderStatus } from '../../src/types';

const STATUS_ICONS: Record<OrderStatus, keyof typeof Ionicons.glyphMap> = {
  placed: 'receipt',
  confirmed: 'restaurant',
  preparing: 'flame',
  picked_up: 'bicycle',
  delivered: 'checkmark-circle',
  cancelled: 'close-circle',
};

export default function OrderTrackingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getOrderById, advanceOrderStatus, cancelOrder } = useOrders();

  const order = getOrderById(id);

  if (!order) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
        <Text style={styles.errorTitle}>Order Not Found</Text>
        <Text style={styles.errorDesc}>We couldn't locate tracking details for this order ID.</Text>
        <Button
          title="Return to Home"
          variant="primary"
          onPress={() => router.replace('/(tabs)')}
          style={{ marginTop: 20 }}
        />
      </SafeAreaView>
    );
  }

  const isDelivered = order.status === 'delivered';
  const isCancelled = order.status === 'cancelled';

  const handleCallRider = () => {
    Alert.alert('Call Rider', `Calling ${order.rider?.name || 'Rider'} at ${order.rider?.phone}...`);
  };

  const handleMessageRider = () => {
    Alert.alert(
      'Message Rider',
      `Direct messenger with ${order.rider?.name || 'Rider'}:\n"Hi, I'm waiting near the front lobby entrance."`
    );
  };

  const handleAdvanceStatus = () => {
    advanceOrderStatus(order.id);
  };

  const handleCancel = () => {
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'Keep Order', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: () => cancelOrder(order.id),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header */}
      <View style={styles.topNav}>
        <TouchableOpacity
          style={styles.backCircleBtn}
          onPress={() => router.replace('/(tabs)/orders')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.navTitle}>Live Order Tracking</Text>
          <Text style={styles.orderNumberText}>Order #{order.orderNumber}</Text>
        </View>
        <TouchableOpacity
          style={styles.homeCircleBtn}
          onPress={() => router.replace('/(tabs)')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="home-outline" size={20} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Animated Status Hero Banner */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroStatusHeading}>
                {isDelivered
                  ? 'Order Delivered! 🎉'
                  : isCancelled
                  ? 'Order Cancelled'
                  : 'On The Way to You'}
              </Text>
              <Text style={styles.heroStatusSub}>
                {isDelivered
                  ? 'Delivered right to your doorstep. Bon appétit!'
                  : isCancelled
                  ? 'This order has been cancelled.'
                  : `Estimated Arrival: ${order.estimatedDeliveryTime}`}
              </Text>
            </View>

            <View style={styles.statusBigIconWrap}>
              <Ionicons
                name={STATUS_ICONS[order.status]}
                size={32}
                color={COLORS.white}
              />
            </View>
          </View>

          {/* Refresh Action */}
          {!isDelivered && !isCancelled && (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.demoAdvanceBtn}
              onPress={handleAdvanceStatus}
            >
              <Ionicons name="refresh" size={14} color={COLORS.white} />
              <Text style={styles.demoAdvanceText}>
                Refresh Order Status
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Live Route Visual Representation */}
        <View style={styles.mapCard}>
          <View style={styles.mapHeaderRow}>
            <Text style={styles.mapLabel}>Live Delivery Route</Text>
            <Badge label="Live GPS" variant="success" size="sm" />
          </View>
          <View style={styles.mapGraphic}>
            <View style={styles.mapPin}>
              <Ionicons name="restaurant" size={16} color={COLORS.white} />
              <Text style={styles.mapPinText}>Kitchen</Text>
            </View>
            <View style={styles.mapDottedLine} />
            <View style={[styles.mapPin, styles.mapPinRider]}>
              <Ionicons name="bicycle" size={18} color={COLORS.white} />
              <Text style={styles.mapPinText}>Rider</Text>
            </View>
            <View style={styles.mapDottedLine} />
            <View style={[styles.mapPin, styles.mapPinHome]}>
              <Ionicons name="home" size={16} color={COLORS.white} />
              <Text style={styles.mapPinText}>You</Text>
            </View>
          </View>
          <Text style={styles.mapDestinationText}>
            Destined for: {order.deliveryAddress.street}
          </Text>
        </View>

        {/* Order Status Timeline (5 Milestones) */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardHeaderTitle}>Order Progress</Text>

          <View style={styles.timeline}>
            {order.timeline.map((step, idx) => {
              const isCurrent = order.status === step.status;
              const isPastOrDone = step.completed;

              return (
                <View key={step.status} style={styles.timelineStep}>
                  {/* Left Column: Icon + Line */}
                  <View style={styles.timelineLeft}>
                    <View
                      style={[
                        styles.timelineNode,
                        isPastOrDone && styles.timelineNodeDone,
                        isCurrent && styles.timelineNodeCurrent,
                      ]}
                    >
                      <Ionicons
                        name={STATUS_ICONS[step.status]}
                        size={15}
                        color={isPastOrDone ? COLORS.white : COLORS.textMuted}
                      />
                    </View>
                    {idx < order.timeline.length - 1 && (
                      <View
                        style={[
                          styles.timelineConnector,
                          isPastOrDone && styles.timelineConnectorDone,
                        ]}
                      />
                    )}
                  </View>

                  {/* Right Column: Title + Desc */}
                  <View style={styles.timelineRight}>
                    <View style={styles.stepTitleRow}>
                      <Text
                        style={[
                          styles.stepTitle,
                          (isCurrent || isPastOrDone) && styles.stepTitleActive,
                        ]}
                      >
                        {step.title}
                      </Text>
                      <Text style={styles.stepTime}>{step.time}</Text>
                    </View>
                    <Text style={styles.stepDesc}>{step.description}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Assigned Courier / Rider Card */}
        {order.rider && !isCancelled && (
          <View style={styles.sectionCard}>
            <Text style={styles.cardHeaderTitle}>Your Delivery Driver</Text>
            <View style={styles.riderRow}>
              <Image source={{ uri: order.rider.photo }} style={styles.riderAvatar} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.riderName}>{order.rider.name}</Text>
                <Text style={styles.riderVehicle}>{order.rider.vehicle}</Text>
                <View style={styles.riderRatingRow}>
                  <Ionicons name="star" size={13} color={COLORS.star} />
                  <Text style={styles.riderRatingText}>{order.rider.rating} rating</Text>
                </View>
              </View>

              <View style={styles.riderActions}>
                <TouchableOpacity
                  style={styles.riderActionBtn}
                  onPress={handleCallRider}
                >
                  <Ionicons name="call" size={18} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.riderActionBtn, { marginLeft: 8 }]}
                  onPress={handleMessageRider}
                >
                  <Ionicons name="chatbubble-ellipses" size={18} color={COLORS.secondary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Order Details & Receipt */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardHeaderTitle}>Order Details & Receipt</Text>

          <View style={styles.restaurantRow}>
            <Image source={{ uri: order.restaurantImage }} style={styles.restThumb} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.restTitle}>{order.restaurantName}</Text>
              <Text style={styles.orderDate}>
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>

          {/* Items List */}
          <View style={styles.itemsWrapper}>
            {order.items.map((item, i) => (
              <View key={i} style={styles.receiptItem}>
                <Text style={styles.receiptQty}>{item.quantity}x</Text>
                <View style={{ flex: 1, marginHorizontal: 8 }}>
                  <Text style={styles.receiptFoodName}>{item.food.name}</Text>
                  {item.selectedCustomizations.map((c, ci) => (
                    <Text key={ci} style={styles.receiptCustomization}>
                      • {c.choiceName}
                    </Text>
                  ))}
                </View>
                <Text style={styles.receiptPrice}>${item.itemTotal.toFixed(2)}</Text>
              </View>
            ))}
          </View>

          {/* Pricing Totals */}
          <View style={styles.totalsWrapper}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text style={styles.totalsVal}>${order.subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Delivery Fee</Text>
              <Text style={styles.totalsVal}>
                {order.deliveryFee === 0 ? 'FREE' : `$${order.deliveryFee.toFixed(2)}`}
              </Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Tax</Text>
              <Text style={styles.totalsVal}>${order.tax.toFixed(2)}</Text>
            </View>
            {order.discount > 0 && (
              <View style={styles.totalsRow}>
                <Text style={[styles.totalsLabel, { color: COLORS.secondary, fontWeight: '700' }]}>
                  Discount ({order.promoCode})
                </Text>
                <Text style={[styles.totalsVal, { color: COLORS.secondary, fontWeight: '800' }]}>
                  -${order.discount.toFixed(2)}
                </Text>
              </View>
            )}
            <View style={styles.totalsDivider} />
            <View style={styles.totalsRow}>
              <Text style={styles.totalsGrandLabel}>Total Paid</Text>
              <Text style={styles.totalsGrandVal}>${order.total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Cancel Action if placed early */}
        {!isDelivered && !isCancelled && order.status === 'placed' && (
          <TouchableOpacity onPress={handleCancel} style={styles.cancelBtn}>
            <Text style={styles.cancelBtnText}>Cancel Order</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: COLORS.background,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 12,
  },
  errorDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  homeCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  orderNumberText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    padding: 18,
    marginBottom: 14,
    ...SHADOWS.md,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroStatusHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
  },
  heroStatusSub: {
    fontSize: 13,
    color: '#D4E8DD',
    marginTop: 4,
    maxWidth: 240,
  },
  statusBigIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoAdvanceBtn: {
    marginTop: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoAdvanceText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  mapCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  mapHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  mapLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  mapGraphic: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  mapPin: {
    backgroundColor: COLORS.primary,
    padding: 8,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    minWidth: 54,
  },
  mapPinRider: {
    backgroundColor: COLORS.secondary,
  },
  mapPinHome: {
    backgroundColor: COLORS.primaryDark,
  },
  mapPinText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  mapDottedLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: 8,
  },
  mapDestinationText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 10,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 14,
  },
  timeline: {
    paddingLeft: 4,
  },
  timelineStep: {
    flexDirection: 'row',
    minHeight: 54,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 30,
  },
  timelineNode: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F3F4F3',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  timelineNodeDone: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timelineNodeCurrent: {
    borderColor: COLORS.secondary,
    borderWidth: 2,
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 4,
  },
  timelineConnectorDone: {
    backgroundColor: COLORS.primary,
  },
  timelineRight: {
    flex: 1,
    marginLeft: 12,
    paddingBottom: 14,
  },
  stepTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  stepTitleActive: {
    color: COLORS.text,
    fontWeight: '700',
  },
  stepTime: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  stepDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  riderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riderAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EAEAEA',
  },
  riderName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  riderVehicle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  riderRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  riderRatingText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginLeft: 3,
  },
  riderActions: {
    flexDirection: 'row',
  },
  riderActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F4F3',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  restaurantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  restThumb: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
  },
  restTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  orderDate: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  itemsWrapper: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  receiptItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 4,
  },
  receiptQty: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    width: 24,
  },
  receiptFoodName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  receiptCustomization: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  receiptPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  totalsWrapper: {
    paddingTop: 10,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  totalsLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  totalsVal: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  totalsDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 8,
  },
  totalsGrandLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  totalsGrandVal: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primary,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.error,
  },
});
