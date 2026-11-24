import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomCartBar } from '../../src/components/BottomCartBar';
import { Button } from '../../src/components/Button';
import { CategoryPill } from '../../src/components/CategoryPill';
import { FoodCard } from '../../src/components/FoodCard';
import { Header } from '../../src/components/Header';
import { PromoBanner } from '../../src/components/PromoBanner';
import { RestaurantCard } from '../../src/components/RestaurantCard';
import { SearchBar } from '../../src/components/SearchBar';
import { COLORS, RADIUS, SHADOWS } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';
import { useCart } from '../../src/context/CartContext';
import { CATEGORIES } from '../../src/data/categories';
import { FOODS } from '../../src/data/foods';
import { PROMOTIONS } from '../../src/data/promotions';
import { RESTAURANTS } from '../../src/data/restaurants';
import { DeliveryAddress, FoodCategory } from '../../src/types';

export default function HomeScreen() {
  const router = useRouter();
  const { addresses, selectedAddress, setSelectedAddress } = useAuth();
  const { applyPromoCode } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [appliedPromoNotice, setAppliedPromoNotice] = useState<string | null>(null);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  };

  const handleSelectCategory = (catName: FoodCategory) => {
    if (selectedCategory === catName) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(catName);
    }
  };

  const handleApplyPromoBanner = (code: string) => {
    const res = applyPromoCode(code);
    setAppliedPromoNotice(res.message);
    setTimeout(() => setAppliedPromoNotice(null), 3500);
  };

  // Filter restaurants by category or search
  const filteredRestaurants = RESTAURANTS.filter((r) => {
    const matchesCategory = selectedCategory ? r.categories.includes(selectedCategory) : true;
    const matchesSearch = searchQuery
      ? r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  const popularRestaurants = RESTAURANTS.filter((r) => r.isTopRated);
  const recommendedFoods = FOODS.filter((f) => f.isRecommended).slice(0, 8);
  const bestSellerFoods = FOODS.filter((f) => f.isPopular).slice(0, 8);
  const africanSpecials = FOODS.filter((f) => f.category === 'African Food');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top Header with Address Selector & Cart Counter */}
      <Header onAddressPress={() => setAddressModalVisible(true)} />

      {/* Floating Promo feedback notice */}
      {appliedPromoNotice && (
        <View style={styles.noticeToast}>
          <Ionicons name="checkmark-circle" size={18} color={COLORS.white} />
          <Text style={styles.noticeText}>{appliedPromoNotice}</Text>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search restaurants, jollof, burgers, pizza..."
            onFilterPress={() => router.push('/(tabs)/explore')}
          />
        </View>

        {/* Promotional Carousel */}
        <View style={styles.promoSection}>
          <FlatList
            data={PROMOTIONS}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalListPadding}
            renderItem={({ item }) => (
              <PromoBanner
                promo={item}
                onPress={() => handleApplyPromoBanner(item.code)}
              />
            )}
          />
        </View>

        {/* Food Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Food Categories</Text>
          {selectedCategory && (
            <TouchableOpacity onPress={() => setSelectedCategory(null)}>
              <Text style={styles.clearFilterText}>Reset filter</Text>
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={CATEGORIES}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalListPadding}
          renderItem={({ item }) => (
            <CategoryPill
              category={item}
              isSelected={selectedCategory === item.name}
              onSelect={() => handleSelectCategory(item.name)}
            />
          )}
        />

        {/* African Delicacies Spotlight Section */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>African Cuisine Specials 🇳🇬</Text>
            <Text style={styles.sectionSubtitle}>Authentic Jollof, Suya, Egusi & Grills</Text>
          </View>
          <TouchableOpacity onPress={() => handleSelectCategory('African Food')}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={africanSpecials}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalListPadding}
          renderItem={({ item }) => (
            <FoodCard
              food={item}
              onPress={() => router.push(`/food/${item.id}`)}
              variant="vertical"
            />
          )}
        />

        {/* Popular Restaurants */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Popular Restaurants</Text>
            <Text style={styles.sectionSubtitle}>Highest customer ratings & fast delivery</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={popularRestaurants}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalListPadding}
          renderItem={({ item }) => (
            <RestaurantCard
              restaurant={item}
              onPress={() => router.push(`/restaurant/${item.id}`)}
              variant="vertical"
              style={{ width: 280, marginRight: 16 }}
            />
          )}
        />

        {/* Recommended For You */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Recommended For You</Text>
            <Text style={styles.sectionSubtitle}>Handcrafted selections based on reviews</Text>
          </View>
        </View>

        <FlatList
          data={recommendedFoods}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalListPadding}
          renderItem={({ item }) => (
            <FoodCard
              food={item}
              onPress={() => router.push(`/food/${item.id}`)}
              variant="vertical"
            />
          )}
        />

        {/* Best Sellers */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Trending & Best Sellers</Text>
            <Text style={styles.sectionSubtitle}>Most ordered meals this week</Text>
          </View>
        </View>

        <FlatList
          data={bestSellerFoods}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalListPadding}
          renderItem={({ item }) => (
            <FoodCard
              food={item}
              onPress={() => router.push(`/food/${item.id}`)}
              variant="vertical"
            />
          )}
        />

        {/* All Restaurants List */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <View>
            <Text style={styles.sectionTitle}>
              {selectedCategory ? `${selectedCategory} Restaurants` : 'All Restaurants Near You'}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {filteredRestaurants.length} places available for delivery
            </Text>
          </View>
        </View>

        <View style={styles.verticalListSection}>
          {filteredRestaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              onPress={() => router.push(`/restaurant/${restaurant.id}`)}
              variant="vertical"
            />
          ))}
        </View>
      </ScrollView>

      {/* Floating Bottom Cart Bar */}
      <BottomCartBar />

      {/* Address Switcher Modal */}
      <Modal
        visible={addressModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddressModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Delivery Address</Text>
              <TouchableOpacity
                onPress={() => setAddressModalVisible(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 300 }}>
              {addresses.map((addr: DeliveryAddress) => {
                const isSelected = selectedAddress?.id === addr.id;
                return (
                  <TouchableOpacity
                    key={addr.id}
                    onPress={() => {
                      setSelectedAddress(addr);
                      setAddressModalVisible(false);
                    }}
                    style={[
                      styles.addressOption,
                      isSelected && styles.addressOptionSelected,
                    ]}
                  >
                    <View style={styles.addressIconWrap}>
                      <Ionicons
                        name={addr.label === 'Work' ? 'briefcase' : 'home'}
                        size={18}
                        color={isSelected ? COLORS.primary : COLORS.textSecondary}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.addressLabel}>{addr.label}</Text>
                      <Text style={styles.addressStreet}>{addr.street}</Text>
                      {addr.apartment ? (
                        <Text style={styles.addressNotes}>{addr.apartment}</Text>
                      ) : null}
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Button
              title="Manage Addresses in Profile"
              variant="outline"
              size="md"
              onPress={() => {
                setAddressModalVisible(false);
                router.push('/(tabs)/profile');
              }}
              style={{ marginTop: 16 }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  promoSection: {
    marginVertical: 8,
  },
  horizontalListPadding: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  clearFilterText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  verticalListSection: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  noticeToast: {
    position: 'absolute',
    top: 70,
    left: 20,
    right: 20,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 999,
    ...SHADOWS.lg,
  },
  noticeText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  addressOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  addressOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  addressIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  addressStreet: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  addressNotes: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
});
