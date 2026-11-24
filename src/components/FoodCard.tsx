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
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { FoodItem } from '../types';
import { Badge } from './Badge';
import { RatingStars } from './RatingStars';

interface FoodCardProps {
  food: FoodItem;
  onPress: () => void;
  variant?: 'vertical' | 'horizontal' | 'compact';
  style?: ViewStyle;
}

export const FoodCard: React.FC<FoodCardProps> = ({
  food,
  onPress,
  variant = 'vertical',
  style,
}) => {
  const { addToCart } = useCart();
  const { isFoodFavorite, toggleFavoriteFood } = useFavorites();
  const isFav = isFoodFavorite(food.id);

  const handleQuickAdd = () => {
    addToCart(food, 1, []);
  };

  if (variant === 'horizontal') {
    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onPress}
        style={[styles.horizontalCard, style]}
      >
        <View style={styles.horizontalContent}>
          <View>
            <View style={styles.tagRow}>
              {food.isPopular && <Badge label="Popular" variant="secondary" size="sm" />}
              {food.isSpicy && (
                <Badge
                  label="Spicy"
                  variant="error"
                  size="sm"
                  style={{ marginLeft: 6 }}
                />
              )}
              {food.isVegetarian && (
                <Badge
                  label="Veg"
                  variant="success"
                  size="sm"
                  style={{ marginLeft: 6 }}
                />
              )}
            </View>

            <Text style={styles.horizontalName} numberOfLines={2}>
              {food.name}
            </Text>

            <Text style={styles.horizontalDesc} numberOfLines={2}>
              {food.description}
            </Text>
          </View>

          <View style={styles.horizontalBottomRow}>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>${food.price.toFixed(2)}</Text>
              {food.originalPrice ? (
                <Text style={styles.originalPrice}>${food.originalPrice.toFixed(2)}</Text>
              ) : null}
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleQuickAdd}
              style={styles.addBtn}
            >
              <Ionicons name="add" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.horizontalImageWrapper}>
          <Image source={{ uri: food.image }} style={styles.horizontalImage} resizeMode="cover" />
          <TouchableOpacity
            style={styles.favSmallBtn}
            onPress={() => toggleFavoriteFood(food.id)}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons
              name={isFav ? 'heart' : 'heart-outline'}
              size={16}
              color={isFav ? COLORS.error : COLORS.white}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }

  // Vertical card (used in menus, grids, recommendations)
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[styles.verticalCard, style]}
    >
      <View style={styles.verticalImageWrapper}>
        <Image source={{ uri: food.image }} style={styles.verticalImage} resizeMode="cover" />

        <TouchableOpacity
          style={styles.favSmallBtn}
          onPress={() => toggleFavoriteFood(food.id)}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Ionicons
            name={isFav ? 'heart' : 'heart-outline'}
            size={18}
            color={isFav ? COLORS.error : COLORS.white}
          />
        </TouchableOpacity>

        {food.isPopular ? (
          <View style={styles.popularBadge}>
            <Badge label="Popular" variant="secondary" size="sm" />
          </View>
        ) : null}
      </View>

      <View style={styles.verticalContent}>
        <Text style={styles.restaurantName} numberOfLines={1}>
          {food.restaurantName}
        </Text>

        <Text style={styles.verticalName} numberOfLines={2}>
          {food.name}
        </Text>

        <View style={styles.ratingRow}>
          <RatingStars rating={food.rating} ratingCount={food.ratingCount} size={11} />
          <Text style={styles.prepTime}>• {food.preparationTime}</Text>
        </View>

        <View style={styles.verticalBottomRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>${food.price.toFixed(2)}</Text>
            {food.originalPrice ? (
              <Text style={styles.originalPrice}>${food.originalPrice.toFixed(2)}</Text>
            ) : null}
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleQuickAdd}
            style={styles.addBtn}
          >
            <Ionicons name="add" size={18} color={COLORS.white} />
          </TouchableOpacity>
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
    width: 200,
    marginRight: 14,
    ...SHADOWS.sm,
  },
  verticalImageWrapper: {
    height: 130,
    width: '100%',
    position: 'relative',
    backgroundColor: '#EAEAEA',
  },
  verticalImage: {
    width: '100%',
    height: '100%',
  },
  popularBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 2,
  },
  favSmallBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  verticalContent: {
    padding: 12,
  },
  restaurantName: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  verticalName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    minHeight: 38,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  prepTime: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginLeft: 4,
  },
  verticalBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  horizontalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    flexDirection: 'row',
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  horizontalContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingRight: 12,
  },
  horizontalName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 4,
    lineHeight: 20,
  },
  horizontalDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  horizontalBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  horizontalImageWrapper: {
    width: 95,
    height: 95,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    position: 'relative',
  },
  horizontalImage: {
    width: '100%',
    height: '100%',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  originalPrice: {
    fontSize: 12,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
});
