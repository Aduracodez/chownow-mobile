import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import { RatingStars } from '../../src/components/RatingStars';
import { COLORS, RADIUS, SHADOWS } from '../../src/constants/theme';
import { useCart } from '../../src/context/CartContext';
import { useFavorites } from '../../src/context/FavoritesContext';
import { FOODS } from '../../src/data/foods';
import { CartCustomization } from '../../src/types';

const { width } = Dimensions.get('window');

export default function FoodDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addToCart, confirmSwitchRestaurantAndAdd } = useCart();
  const { isFoodFavorite, toggleFavoriteFood } = useFavorites();

  const food = useMemo(() => {
    return FOODS.find((f) => f.id === id) || FOODS[0];
  }, [id]);

  const isFav = isFoodFavorite(food.id);

  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Selected customizations: map of groupId -> list of selected choices
  const [selectedChoices, setSelectedChoices] = useState<Record<string, CartCustomization[]>>(() => {
    const initial: Record<string, CartCustomization[]> = {};
    if (food.customizations) {
      food.customizations.forEach((group) => {
        if (group.required && group.options.length > 0) {
          initial[group.id] = [
            {
              groupId: group.id,
              groupTitle: group.title,
              choiceId: group.options[0].id,
              choiceName: group.options[0].name,
              price: group.options[0].price,
            },
          ];
        } else {
          initial[group.id] = [];
        }
      });
    }
    return initial;
  });

  const handleSelectOption = (
    groupId: string,
    groupTitle: string,
    choice: { id: string; name: string; price: number },
    required: boolean,
    maxSelect?: number
  ) => {
    const current = selectedChoices[groupId] || [];

    if (required || (maxSelect && maxSelect === 1)) {
      // Single select
      setSelectedChoices({
        ...selectedChoices,
        [groupId]: [
          {
            groupId,
            groupTitle,
            choiceId: choice.id,
            choiceName: choice.name,
            price: choice.price,
          },
        ],
      });
    } else {
      // Multi select toggle
      const exists = current.some((c) => c.choiceId === choice.id);
      if (exists) {
        setSelectedChoices({
          ...selectedChoices,
          [groupId]: current.filter((c) => c.choiceId !== choice.id),
        });
      } else {
        if (maxSelect && current.length >= maxSelect) {
          Alert.alert('Limit Reached', `You can select up to ${maxSelect} options.`);
          return;
        }
        setSelectedChoices({
          ...selectedChoices,
          [groupId]: [
            ...current,
            {
              groupId,
              groupTitle,
              choiceId: choice.id,
              choiceName: choice.name,
              price: choice.price,
            },
          ],
        });
      }
    }
  };

  // Flattened selected customizations list
  const allCustomizations: CartCustomization[] = useMemo(() => {
    return Object.values(selectedChoices).flat();
  }, [selectedChoices]);

  // Unit price with customizations
  const unitPrice = useMemo(() => {
    const addOnsTotal = allCustomizations.reduce((sum, c) => sum + c.price, 0);
    return food.price + addOnsTotal;
  }, [food.price, allCustomizations]);

  const totalPrice = Number((unitPrice * quantity).toFixed(2));

  const handleAddToCart = () => {
    // Validate required selections
    if (food.customizations) {
      for (const group of food.customizations) {
        if (group.required && (!selectedChoices[group.id] || selectedChoices[group.id].length === 0)) {
          Alert.alert('Required Selection', `Please make a selection for "${group.title}".`);
          return;
        }
      }
    }

    const res = addToCart(food, quantity, allCustomizations, specialInstructions);

    if (res.requiresRestaurantSwitch) {
      Alert.alert(
        'Switch Restaurant?',
        `Your cart contains items from "${res.currentRestaurant}". Create a new cart with items from "${food.restaurantName}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Start New Cart',
            style: 'destructive',
            onPress: () => {
              confirmSwitchRestaurantAndAdd(
                food,
                quantity,
                allCustomizations,
                specialInstructions
              );
              router.back();
            },
          },
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Large Food Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: food.image }} style={styles.image} resizeMode="cover" />

          <SafeAreaView style={styles.topBarOverlay} edges={['top']}>
            <TouchableOpacity
              style={styles.circleBtn}
              onPress={() => router.back()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={22} color={COLORS.text} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.circleBtn}
              onPress={() => toggleFavoriteFood(food.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={isFav ? 'heart' : 'heart-outline'}
                size={22}
                color={isFav ? COLORS.error : COLORS.text}
              />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        {/* Info Card */}
        <View style={styles.infoSection}>
          <Text style={styles.restaurantName}>{food.restaurantName}</Text>
          <Text style={styles.foodName}>{food.name}</Text>

          <View style={styles.ratingsRow}>
            <RatingStars rating={food.rating} ratingCount={food.ratingCount} size={14} />
            <Text style={styles.dot}>•</Text>
            <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.metaText}>{food.preparationTime}</Text>
            {food.calories ? (
              <>
                <Text style={styles.dot}>•</Text>
                <Ionicons name="flame-outline" size={14} color={COLORS.secondary} />
                <Text style={styles.metaText}>{food.calories} kcal</Text>
              </>
            ) : null}
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>${food.price.toFixed(2)}</Text>
            {food.originalPrice ? (
              <Text style={styles.originalPrice}>${food.originalPrice.toFixed(2)}</Text>
            ) : null}
          </View>

          <Text style={styles.description}>{food.description}</Text>

          {/* Tags */}
          <View style={styles.tagsRow}>
            {food.isPopular && <Badge label="Best Seller" variant="secondary" size="md" />}
            {food.isSpicy && (
              <Badge label="Spicy Flavor 🔥" variant="error" size="md" style={{ marginLeft: 8 }} />
            )}
            {food.isVegetarian && (
              <Badge label="Vegetarian 🌱" variant="success" size="md" style={{ marginLeft: 8 }} />
            )}
          </View>

          {/* Ingredients list */}
          <View style={styles.ingredientsSection}>
            <Text style={styles.sectionHeading}>Fresh Ingredients</Text>
            <View style={styles.ingredientChipsWrap}>
              {food.ingredients.map((ing, i) => (
                <View key={i} style={styles.ingredientChip}>
                  <Text style={styles.ingredientText}>{ing}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Customization Options */}
          {food.customizations && food.customizations.length > 0 && (
            <View style={styles.customizationsSection}>
              {food.customizations.map((group) => {
                const groupSelected = selectedChoices[group.id] || [];

                return (
                  <View key={group.id} style={styles.customGroup}>
                    <View style={styles.groupHeaderRow}>
                      <Text style={styles.groupTitle}>{group.title}</Text>
                      {group.required ? (
                        <Badge label="Required" variant="primary" size="sm" />
                      ) : (
                        <Text style={styles.optionalText}>
                          Optional{group.maxSelect ? ` (Up to ${group.maxSelect})` : ''}
                        </Text>
                      )}
                    </View>

                    {group.options.map((opt) => {
                      const isOptionSelected = groupSelected.some((c) => c.choiceId === opt.id);

                      return (
                        <TouchableOpacity
                          key={opt.id}
                          activeOpacity={0.7}
                          onPress={() =>
                            handleSelectOption(
                              group.id,
                              group.title,
                              opt,
                              group.required,
                              group.maxSelect
                            )
                          }
                          style={[
                            styles.optionRow,
                            isOptionSelected && styles.optionRowSelected,
                          ]}
                        >
                          <View style={styles.optionLeft}>
                            <View
                              style={[
                                styles.checkboxCircle,
                                isOptionSelected && styles.checkboxCircleSelected,
                              ]}
                            >
                              {isOptionSelected && (
                                <Ionicons name="checkmark" size={14} color={COLORS.white} />
                              )}
                            </View>
                            <Text style={styles.optionName}>{opt.name}</Text>
                          </View>

                          <Text style={styles.optionPrice}>
                            {opt.price === 0 ? 'Free' : `+$${opt.price.toFixed(2)}`}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                );
              })}
            </View>
          )}

          {/* Special Instructions Input */}
          <View style={styles.instructionsSection}>
            <Text style={styles.sectionHeading}>Special Preparation Requests</Text>
            <TextInput
              style={styles.instructionInput}
              placeholder="e.g. Sauce on the side, extra crispy, no cutlery..."
              placeholderTextColor={COLORS.textMuted}
              value={specialInstructions}
              onChangeText={setSpecialInstructions}
              multiline
              numberOfLines={2}
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <SafeAreaView style={styles.bottomBar} edges={['bottom']}>
        {/* Quantity Selector */}
        <View style={styles.qtyContainer}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
          >
            <Ionicons
              name="remove"
              size={18}
              color={quantity <= 1 ? COLORS.textMuted : COLORS.text}
            />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{quantity}</Text>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => setQuantity((q) => q + 1)}
          >
            <Ionicons name="add" size={18} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Add to Cart Button */}
        <Button
          title={`Add to Cart • $${totalPrice.toFixed(2)}`}
          variant="primary"
          size="lg"
          icon={<Ionicons name="cart" size={18} color={COLORS.white} />}
          onPress={handleAddToCart}
          style={{ flex: 1, marginLeft: 16 }}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  imageContainer: {
    width: '100%',
    height: 280,
    position: 'relative',
    backgroundColor: '#EAEAEA',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  topBarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    zIndex: 10,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  infoSection: {
    padding: 20,
  },
  restaurantName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  foodName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 4,
  },
  ratingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  dot: {
    marginHorizontal: 8,
    color: COLORS.textMuted,
  },
  metaText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 12,
  },
  price: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.primary,
  },
  originalPrice: {
    fontSize: 16,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginTop: 10,
  },
  tagsRow: {
    flexDirection: 'row',
    marginTop: 14,
  },
  ingredientsSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 16,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10,
  },
  ingredientChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  ingredientChip: {
    backgroundColor: '#F3F4F3',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: RADIUS.full,
    marginRight: 6,
    marginBottom: 6,
  },
  ingredientText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500',
  },
  customizationsSection: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 16,
  },
  customGroup: {
    marginBottom: 18,
  },
  groupHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  groupTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  optionalText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
  },
  optionRowSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkboxCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxCircleSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionName: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  optionPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  instructionsSection: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 16,
  },
  instructionInput: {
    backgroundColor: '#F8FAF9',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    fontSize: 13,
    color: COLORS.text,
    minHeight: 64,
    textAlignVertical: 'top',
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
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F3',
    borderRadius: RADIUS.full,
    padding: 4,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  qtyText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    paddingHorizontal: 12,
  },
});
