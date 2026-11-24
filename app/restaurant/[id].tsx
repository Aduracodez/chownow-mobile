import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge } from '../../src/components/Badge';
import { BottomCartBar } from '../../src/components/BottomCartBar';
import { FoodCard } from '../../src/components/FoodCard';
import { RatingStars } from '../../src/components/RatingStars';
import { SearchBar } from '../../src/components/SearchBar';
import { COLORS, RADIUS, SHADOWS } from '../../src/constants/theme';
import { useFavorites } from '../../src/context/FavoritesContext';
import { FOODS } from '../../src/data/foods';
import { RESTAURANTS } from '../../src/data/restaurants';
import { FoodCategory } from '../../src/types';

const { width } = Dimensions.get('window');

export default function RestaurantDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isRestaurantFavorite, toggleFavoriteRestaurant } = useFavorites();

  const [menuSearch, setMenuSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const restaurant = useMemo(() => {
    return RESTAURANTS.find((r) => r.id === id) || RESTAURANTS[0];
  }, [id]);

  const isFav = isRestaurantFavorite(restaurant.id);

  // Foods belonging to this restaurant or matching the restaurant's categories
  const restaurantFoods = useMemo(() => {
    let list = FOODS.filter((f) => f.restaurantId === restaurant.id);
    // If fewer than 5 items explicitly tied to this restaurant, augment with relevant category foods for rich menu preview
    if (list.length < 5) {
      const categoryFoods = FOODS.filter(
        (f) =>
          restaurant.categories.includes(f.category) &&
          !list.some((existing) => existing.id === f.id)
      );
      list = [...list, ...categoryFoods];
    }
    return list;
  }, [restaurant]);

  // Unique categories in this restaurant's menu
  const menuCategories = useMemo(() => {
    const cats = Array.from(new Set(restaurantFoods.map((f) => f.category)));
    return ['All', ...cats];
  }, [restaurantFoods]);

  // Filtered by active category and search
  const filteredFoods = useMemo(() => {
    return restaurantFoods.filter((f) => {
      const matchesCat = activeCategory === 'All' ? true : f.category === activeCategory;
      const matchesSearch = menuSearch.trim()
        ? f.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
          f.description.toLowerCase().includes(menuSearch.toLowerCase())
        : true;
      return matchesCat && matchesSearch;
    });
  }, [restaurantFoods, activeCategory, menuSearch]);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Cover Photo & Navigation Bar */}
        <View style={styles.coverWrapper}>
          <Image source={{ uri: restaurant.coverImage }} style={styles.coverImage} resizeMode="cover" />

          <SafeAreaView style={styles.topNavOverlay} edges={['top']}>
            <TouchableOpacity
              style={styles.navCircleBtn}
              onPress={() => router.back()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="arrow-back" size={20} color={COLORS.text} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navCircleBtn}
              onPress={() => toggleFavoriteRestaurant(restaurant.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={isFav ? 'heart' : 'heart-outline'}
                size={20}
                color={isFav ? COLORS.error : COLORS.text}
              />
            </TouchableOpacity>
          </SafeAreaView>

          {restaurant.discountBadge ? (
            <View style={styles.discountBadgeWrap}>
              <Badge label={restaurant.discountBadge} variant="secondary" size="md" />
            </View>
          ) : null}
        </View>

        {/* Restaurant Header Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.restName}>{restaurant.name}</Text>
          <Text style={styles.cuisineText}>
            {restaurant.cuisine} • {restaurant.secondaryCuisine || 'Specialty'}
          </Text>

          <View style={styles.ratingsRow}>
            <RatingStars rating={restaurant.rating} ratingCount={restaurant.ratingCount} size={15} />
            <Text style={styles.dot}>•</Text>
            <Text style={styles.hoursText}>{restaurant.openingHours}</Text>
          </View>

          <View style={styles.metaPillsRow}>
            <View style={styles.metaPill}>
              <Ionicons name="time-outline" size={14} color={COLORS.primary} />
              <Text style={styles.metaPillText}>{restaurant.deliveryTime}</Text>
            </View>

            <View style={styles.metaPill}>
              <Ionicons name="bicycle" size={14} color={COLORS.primary} />
              <Text style={styles.metaPillText}>
                {restaurant.deliveryFee === 0 ? 'Free Delivery' : `$${restaurant.deliveryFee.toFixed(2)}`}
              </Text>
            </View>

            <View style={styles.metaPill}>
              <Ionicons name="location-outline" size={14} color={COLORS.primary} />
              <Text style={styles.metaPillText}>{restaurant.distance}</Text>
            </View>
          </View>

          <Text style={styles.descText}>{restaurant.description}</Text>
        </View>

        {/* Menu Search Bar */}
        <View style={styles.searchSection}>
          <SearchBar
            value={menuSearch}
            onChangeText={setMenuSearch}
            placeholder={`Search menu in ${restaurant.name}...`}
          />
        </View>

        {/* Category Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {menuCategories.map((cat) => {
            const isSelected = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setActiveCategory(cat)}
                style={[styles.catTabBtn, isSelected && styles.catTabBtnActive]}
              >
                <Text style={[styles.catTabText, isSelected && styles.catTabTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Menu Items List */}
        <View style={styles.menuSection}>
          <Text style={styles.menuTitle}>
            {activeCategory === 'All' ? 'Full Menu' : `${activeCategory} Selections`} (
            {filteredFoods.length})
          </Text>

          {filteredFoods.map((food) => (
            <FoodCard
              key={food.id}
              food={food}
              onPress={() => router.push(`/food/${food.id}`)}
              variant="horizontal"
            />
          ))}
        </View>
      </ScrollView>

      <BottomCartBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  coverWrapper: {
    height: 240,
    width: '100%',
    position: 'relative',
    backgroundColor: '#333',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  topNavOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    zIndex: 10,
  },
  navCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  discountBadgeWrap: {
    position: 'absolute',
    bottom: 14,
    left: 16,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  restName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  cuisineText: {
    fontSize: 14,
    color: COLORS.textSecondary,
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
  hoursText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  metaPillsRow: {
    flexDirection: 'row',
    marginTop: 12,
    flexWrap: 'wrap',
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: RADIUS.full,
    marginRight: 8,
    marginBottom: 6,
  },
  metaPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 4,
  },
  descText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginTop: 10,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  catTabBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  catTabBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  catTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  catTabTextActive: {
    color: COLORS.white,
  },
  menuSection: {
    paddingHorizontal: 16,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 12,
    marginTop: 4,
  },
});
