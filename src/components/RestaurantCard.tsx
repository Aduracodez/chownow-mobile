import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';
import { useFavorites } from '../context/FavoritesContext';
import { Restaurant } from '../types';
import { Badge } from './Badge';
import { RatingStars } from './RatingStars';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress: () => void;
  variant?: 'vertical' | 'horizontal' | 'compact';
  style?: ViewStyle;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  onPress,
  variant = 'vertical',
  style,
}) => {
  const { isRestaurantFavorite, toggleFavoriteRestaurant } = useFavorites();
  const isFav = isRestaurantFavorite(restaurant.id);

  if (variant === 'horizontal') {
    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onPress}
        style={[styles.horizontalCard, style]}
      >
        <View style={styles.horizontalImageContainer}>
          <Image
            source={{ uri: restaurant.coverImage }}
            style={styles.horizontalImage}
            resizeMode="cover"
          />
          {restaurant.discountBadge ? (
            <View style={styles.badgeTopLeft}>
              <Badge label={restaurant.discountBadge} variant="secondary" size="sm" />
            </View>
          ) : null}
          <TouchableOpacity
            style={styles.favButton}
            onPress={() => toggleFavoriteRestaurant(restaurant.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={isFav ? 'heart' : 'heart-outline'}
              size={18}
              color={isFav ? COLORS.error : COLORS.white}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.horizontalContent}>
          <View style={styles.rowBetween}>
            <Text style={styles.name} numberOfLines={1}>
              {restaurant.name}
            </Text>
          </View>

          <Text style={styles.cuisine} numberOfLines={1}>
            {restaurant.cuisine} {restaurant.secondaryCuisine ? `• ${restaurant.secondaryCuisine}` : ''}
          </Text>

          <View style={styles.rowMiddle}>
            <RatingStars rating={restaurant.rating} ratingCount={restaurant.ratingCount} size={12} />
            <Text style={styles.dot}>•</Text>
            <View style={styles.row}>
              <Ionicons name="time-outline" size={13} color={COLORS.textSecondary} />
              <Text style={styles.metaText}>{restaurant.deliveryTime}</Text>
            </View>
          </View>

          <View style={styles.rowBetweenBottom}>
            <Text style={styles.feeText}>
              {restaurant.deliveryFee === 0 ? (
                <Text style={styles.freeFee}>Free Delivery</Text>
              ) : (
                `$${restaurant.deliveryFee.toFixed(2)} delivery`
              )}
            </Text>
            <Text style={styles.distanceText}>{restaurant.distance}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Vertical (standard card)
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[styles.verticalCard, style]}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: restaurant.coverImage }}
          style={styles.verticalImage}
          resizeMode="cover"
        />

        {restaurant.discountBadge ? (
          <View style={styles.badgeTopLeft}>
            <Badge label={restaurant.discountBadge} variant="secondary" size="sm" />
          </View>
        ) : restaurant.hasFreeDelivery ? (
          <View style={styles.badgeTopLeft}>
            <Badge label="Free Delivery" variant="success" size="sm" />
          </View>
        ) : null}

        {!restaurant.isOpen && (
          <View style={styles.closedOverlay}>
            <Text style={styles.closedText}>Currently Closed</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.favButton}
          onPress={() => toggleFavoriteRestaurant(restaurant.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={isFav ? 'heart' : 'heart-outline'}
            size={20}
            color={isFav ? COLORS.error : COLORS.white}
          />
        </TouchableOpacity>

        <View style={styles.timeTag}>
          <Ionicons name="bicycle" size={13} color={COLORS.primary} />
          <Text style={styles.timeTagText}>{restaurant.deliveryTime}</Text>
        </View>
      </View>

      <View style={styles.verticalContent}>
        <View style={styles.rowBetween}>
          <Text style={styles.name} numberOfLines={1}>
            {restaurant.name}
          </Text>
          <RatingStars rating={restaurant.rating} ratingCount={restaurant.ratingCount} size={13} />
        </View>

        <Text style={styles.cuisine} numberOfLines={1}>
          {restaurant.cuisine} • {restaurant.secondaryCuisine || 'Specialty'}
        </Text>

        <View style={styles.footerRow}>
          <Text style={styles.feeText}>
            {restaurant.deliveryFee === 0 ? (
              <Text style={styles.freeFee}>Free Delivery</Text>
            ) : (
              `$${restaurant.deliveryFee.toFixed(2)} delivery`
            )}
          </Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.metaText}>Min ${restaurant.minOrder}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.metaText}>{restaurant.distance}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  verticalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: 16,
    ...SHADOWS.md,
  },
  imageContainer: {
    height: 160,
    width: '100%',
    position: 'relative',
    backgroundColor: '#EAEAEA',
  },
  verticalImage: {
    width: '100%',
    height: '100%',
  },
  badgeTopLeft: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 2,
  },
  closedOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  closedText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  favButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  timeTag: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: COLORS.white,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: RADIUS.full,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  timeTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 4,
  },
  verticalContent: {
    padding: 14,
  },
  horizontalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: 14,
    ...SHADOWS.sm,
  },
  horizontalImageContainer: {
    width: 110,
    height: 110,
    position: 'relative',
  },
  horizontalImage: {
    width: '100%',
    height: '100%',
  },
  horizontalContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowBetweenBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  rowMiddle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  cuisine: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  dot: {
    marginHorizontal: 6,
    color: COLORS.textMuted,
    fontSize: 12,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 3,
  },
  feeText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  freeFee: {
    color: COLORS.success,
    fontWeight: '700',
  },
  distanceText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
});
