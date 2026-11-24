import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomCartBar } from '../../src/components/BottomCartBar';
import { EmptyState } from '../../src/components/EmptyState';
import { RestaurantCard } from '../../src/components/RestaurantCard';
import { SearchBar } from '../../src/components/SearchBar';
import { COLORS, RADIUS, SHADOWS } from '../../src/constants/theme';
import { CATEGORIES } from '../../src/data/categories';
import { RESTAURANTS } from '../../src/data/restaurants';
import { FoodCategory, Restaurant } from '../../src/types';

export default function ExploreScreen() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<FoodCategory | 'All'>('All');
  const [onlyFreeDelivery, setOnlyFreeDelivery] = useState(false);
  const [onlyTopRated, setOnlyTopRated] = useState(false);
  const [onlyFastDelivery, setOnlyFastDelivery] = useState(false);
  const [viewMode, setViewMode] = useState<'vertical' | 'horizontal'>('vertical');

  const filteredRestaurants = useMemo(() => {
    return RESTAURANTS.filter((r) => {
      // Search query
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchesName = r.name.toLowerCase().includes(q);
        const matchesCuisine = r.cuisine.toLowerCase().includes(q);
        const matchesAddress = r.address.toLowerCase().includes(q);
        if (!matchesName && !matchesCuisine && !matchesAddress) return false;
      }

      // Cuisine
      if (selectedCuisine !== 'All') {
        if (!r.categories.includes(selectedCuisine) && r.cuisine !== selectedCuisine) {
          return false;
        }
      }

      // Free delivery
      if (onlyFreeDelivery && r.deliveryFee > 0 && !r.hasFreeDelivery) {
        return false;
      }

      // Top rated (4.8+)
      if (onlyTopRated && r.rating < 4.8) {
        return false;
      }

      // Fast delivery (<= 25m)
      if (onlyFastDelivery) {
        const timeNum = parseInt(r.deliveryTime, 10);
        if (isNaN(timeNum) || timeNum > 25) return false;
      }

      return true;
    });
  }, [searchQuery, selectedCuisine, onlyFreeDelivery, onlyTopRated, onlyFastDelivery]);

  const activeFiltersCount =
    (selectedCuisine !== 'All' ? 1 : 0) +
    (onlyFreeDelivery ? 1 : 0) +
    (onlyTopRated ? 1 : 0) +
    (onlyFastDelivery ? 1 : 0);

  const resetFilters = () => {
    setSelectedCuisine('All');
    setOnlyFreeDelivery(false);
    setOnlyTopRated(false);
    setOnlyFastDelivery(false);
    setSearchQuery('');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header & Search */}
      <View style={styles.headerContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.pageTitle}>Explore Restaurants</Text>
          <TouchableOpacity
            style={styles.viewModeToggle}
            onPress={() => setViewMode((prev) => (prev === 'vertical' ? 'horizontal' : 'vertical'))}
          >
            <Ionicons
              name={viewMode === 'vertical' ? 'list' : 'grid'}
              size={18}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by restaurant name or cuisine..."
          style={{ marginTop: 8 }}
        />
      </View>

      {/* Filter Chips Bar */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {/* Free Delivery Chip */}
          <TouchableOpacity
            onPress={() => setOnlyFreeDelivery((prev) => !prev)}
            style={[styles.filterChip, onlyFreeDelivery && styles.filterChipActive]}
          >
            <Ionicons
              name="bicycle"
              size={14}
              color={onlyFreeDelivery ? COLORS.white : COLORS.textSecondary}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.filterChipText, onlyFreeDelivery && styles.filterChipTextActive]}>
              Free Delivery
            </Text>
          </TouchableOpacity>

          {/* Top Rated Chip */}
          <TouchableOpacity
            onPress={() => setOnlyTopRated((prev) => !prev)}
            style={[styles.filterChip, onlyTopRated && styles.filterChipActive]}
          >
            <Ionicons
              name="star"
              size={13}
              color={onlyTopRated ? COLORS.white : COLORS.star}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.filterChipText, onlyTopRated && styles.filterChipTextActive]}>
              4.8+ Rated
            </Text>
          </TouchableOpacity>

          {/* Fast Delivery Chip */}
          <TouchableOpacity
            onPress={() => setOnlyFastDelivery((prev) => !prev)}
            style={[styles.filterChip, onlyFastDelivery && styles.filterChipActive]}
          >
            <Ionicons
              name="flash"
              size={13}
              color={onlyFastDelivery ? COLORS.white : COLORS.secondary}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.filterChipText, onlyFastDelivery && styles.filterChipTextActive]}>
              Fast (&lt;25m)
            </Text>
          </TouchableOpacity>

          {/* Cuisines */}
          <TouchableOpacity
            onPress={() => setSelectedCuisine('All')}
            style={[styles.filterChip, selectedCuisine === 'All' && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, selectedCuisine === 'All' && styles.filterChipTextActive]}>
              All Cuisines
            </Text>
          </TouchableOpacity>

          {CATEGORIES.map((c) => {
            const isSelected = selectedCuisine === c.name;
            return (
              <TouchableOpacity
                key={c.id}
                onPress={() => setSelectedCuisine(isSelected ? 'All' : c.name)}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
              >
                <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                  {c.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Results Bar */}
      <View style={styles.resultsInfoBar}>
        <Text style={styles.resultsCount}>
          {filteredRestaurants.length} {filteredRestaurants.length === 1 ? 'restaurant' : 'restaurants'} found
        </Text>
        {activeFiltersCount > 0 && (
          <TouchableOpacity onPress={resetFilters}>
            <Text style={styles.resetFiltersBtn}>Clear {activeFiltersCount} filters</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Restaurant List */}
      <FlatList
        data={filteredRestaurants}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <RestaurantCard
            restaurant={item}
            onPress={() => router.push(`/restaurant/${item.id}`)}
            variant={viewMode}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="No Restaurants Found"
            description="We couldn't find any restaurants matching your current search and filter settings."
            buttonTitle="Reset All Filters"
            onButtonPress={resetFilters}
            style={{ marginTop: 40 }}
          />
        }
      />

      <BottomCartBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: COLORS.background,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  viewModeToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  filtersContainer: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    paddingVertical: 10,
  },
  filterScroll: {
    paddingHorizontal: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: COLORS.white,
  },
  resultsInfoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  resultsCount: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  resetFiltersBtn: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
});
