import React, { createContext, useContext, useEffect, useState } from 'react';
import { Storage, STORAGE_KEYS } from '../services/storage';

interface FavoritesContextType {
  favoriteRestaurantIds: string[];
  favoriteFoodIds: string[];
  toggleFavoriteRestaurant: (restaurantId: string) => void;
  toggleFavoriteFood: (foodId: string) => void;
  isRestaurantFavorite: (restaurantId: string) => boolean;
  isFoodFavorite: (foodId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favoriteRestaurantIds, setFavoriteRestaurantIds] = useState<string[]>(['rest-1', 'rest-3']);
  const [favoriteFoodIds, setFavoriteFoodIds] = useState<string[]>(['food-1', 'food-7']);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      Storage.set(STORAGE_KEYS.FAVORITES, {
        restaurants: favoriteRestaurantIds,
        foods: favoriteFoodIds,
      });
    }
  }, [favoriteRestaurantIds, favoriteFoodIds, isLoaded]);

  const loadFavorites = async () => {
    try {
      const saved = await Storage.get<{ restaurants: string[]; foods: string[] } | null>(
        STORAGE_KEYS.FAVORITES,
        null
      );
      if (saved) {
        if (Array.isArray(saved.restaurants)) setFavoriteRestaurantIds(saved.restaurants);
        if (Array.isArray(saved.foods)) setFavoriteFoodIds(saved.foods);
      }
    } catch (e) {
      console.warn('Failed to load favorites:', e);
    } finally {
      setIsLoaded(true);
    }
  };

  const toggleFavoriteRestaurant = (restaurantId: string) => {
    setFavoriteRestaurantIds((prev) =>
      prev.includes(restaurantId) ? prev.filter((id) => id !== restaurantId) : [...prev, restaurantId]
    );
  };

  const toggleFavoriteFood = (foodId: string) => {
    setFavoriteFoodIds((prev) =>
      prev.includes(foodId) ? prev.filter((id) => id !== foodId) : [...prev, foodId]
    );
  };

  const isRestaurantFavorite = (restaurantId: string) => {
    return favoriteRestaurantIds.includes(restaurantId);
  };

  const isFoodFavorite = (foodId: string) => {
    return favoriteFoodIds.includes(foodId);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favoriteRestaurantIds,
        favoriteFoodIds,
        toggleFavoriteRestaurant,
        toggleFavoriteFood,
        isRestaurantFavorite,
        isFoodFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
