import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomCartBar } from '../../src/components/BottomCartBar';
import { EmptyState } from '../../src/components/EmptyState';
import { FoodCard } from '../../src/components/FoodCard';
import { RestaurantCard } from '../../src/components/RestaurantCard';
import { COLORS, RADIUS, SHADOWS } from '../../src/constants/theme';
import { useFavorites } from '../../src/context/FavoritesContext';
import { FOODS } from '../../src/data/foods';
import { RESTAURANTS } from '../../src/data/restaurants';

export default function FavouritesScreen() {
  const router = useRouter();
  const { favoriteRestaurantIds, favoriteFoodIds } = useFavorites();
  const [activeTab, setActiveTab] = useState<'restaurants' | 'foods'>('restaurants');

  const favoriteRestaurants = RESTAURANTS.filter((r) =>
    favoriteRestaurantIds.includes(r.id)
  );

  const favoriteFoods = FOODS.filter((f) =>
    favoriteFoodIds.includes(f.id)
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favourites</Text>
        <Text style={styles.headerSubtitle}>Quick access to your preferred foods & places</Text>
      </View>

      {/* Segmented Control */}
      <View style={styles.segmentedContainer}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'restaurants' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('restaurants')}
        >
          <Text
            style={[styles.segmentText, activeTab === 'restaurants' && styles.segmentTextActive]}
          >
            Restaurants ({favoriteRestaurants.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'foods' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('foods')}
        >
          <Text style={[styles.segmentText, activeTab === 'foods' && styles.segmentTextActive]}>
            Dishes ({favoriteFoods.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content list */}
      {activeTab === 'restaurants' ? (
        <FlatList
          data={favoriteRestaurants}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <RestaurantCard
              restaurant={item}
              onPress={() => router.push(`/restaurant/${item.id}`)}
              variant="vertical"
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="heart-outline"
              title="No Favourite Restaurants"
              description="Tap the heart icon on any restaurant to save it here for fast reordering."
              buttonTitle="Explore Restaurants"
              onButtonPress={() => router.push('/(tabs)/explore')}
              style={{ marginTop: 40 }}
            />
          }
        />
      ) : (
        <FlatList
          data={favoriteFoods}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <FoodCard
              food={item}
              onPress={() => router.push(`/food/${item.id}`)}
              variant="horizontal"
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="restaurant-outline"
              title="No Favourite Dishes"
              description="Save your favorite cravings by tapping the heart icon on any meal."
              buttonTitle="Discover Dishes"
              onButtonPress={() => router.push('/(tabs)')}
              style={{ marginTop: 40 }}
            />
          }
        />
      )}

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
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: '#EBEAE4',
    borderRadius: RADIUS.full,
    padding: 4,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: RADIUS.full,
  },
  segmentBtnActive: {
    backgroundColor: COLORS.white,
    ...SHADOWS.sm,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  segmentTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
});
