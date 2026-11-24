import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../src/components/Button';
import { COLORS, RADIUS } from '../src/constants/theme';
import { Storage, STORAGE_KEYS } from '../src/services/storage';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  image: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const SLIDES: OnboardingSlide[] = [
  {
    id: 'slide-1',
    title: 'Discover Delicious Food',
    description:
      'Explore diverse culinary traditions — from smoky West African party jollof and beef suya to gourmet smashed burgers, artisan sourdough pizzas and crisp salads.',
    image:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    icon: 'search-outline',
  },
  {
    id: 'slide-2',
    title: 'Order From Favourite Restaurants',
    description:
      'Browse curated local kitchens and top-tier bistros with full menu customization, flexible dietary choices, and transparent customer reviews.',
    image:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    icon: 'restaurant-outline',
  },
  {
    id: 'slide-3',
    title: 'Get Food Delivered to Your Door',
    description:
      'Experience lightning-fast doorstep delivery with live animated order milestones from kitchen confirmation directly to your hands.',
    image:
      'https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=800&q=80',
    icon: 'bicycle-outline',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleFinish = async () => {
    await Storage.set(STORAGE_KEYS.ONBOARDING_SEEN, true);
    router.replace('/(tabs)');
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
      setCurrentIndex(currentIndex + 1);
    } else {
      handleFinish();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header with Skip Button */}
      <View style={styles.topBar}>
        <Text style={styles.brandText}>
          Chow<Text style={{ color: COLORS.secondary }}>Now</Text>
        </Text>
        <TouchableOpacity onPress={handleFinish}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Slides Carousel */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={styles.imageWrapper}>
              <Image source={{ uri: item.image }} style={styles.slideImage} resizeMode="cover" />
              <View style={styles.iconCircle}>
                <Ionicons name={item.icon} size={28} color={COLORS.white} />
              </View>
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.slideTitle}>{item.title}</Text>
              <Text style={styles.slideDesc}>{item.description}</Text>
            </View>
          </View>
        )}
      />

      {/* Pagination & Next Button */}
      <View style={styles.bottomSection}>
        <View style={styles.dotsRow}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        <View style={styles.btnRow}>
          <Button
            title={currentIndex === SLIDES.length - 1 ? 'Start Ordering' : 'Continue'}
            variant="primary"
            size="lg"
            onPress={handleNext}
            style={{ width: '100%' }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  brandText: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primary,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  slide: {
    width: width,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  imageWrapper: {
    width: width - 48,
    height: height * 0.42,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#EAEAEA',
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  iconCircle: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  textContainer: {
    marginTop: 28,
    alignItems: 'center',
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  slideDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: COLORS.primary,
  },
  dotInactive: {
    width: 8,
    backgroundColor: COLORS.border,
  },
  btnRow: {
    width: '100%',
  },
});
