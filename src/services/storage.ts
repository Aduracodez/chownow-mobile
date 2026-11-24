import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  CART: '@chownow_cart_v1',
  USER: '@chownow_user_v1',
  ORDERS: '@chownow_orders_v1',
  FAVORITES: '@chownow_favorites_v1',
  ADDRESSES: '@chownow_addresses_v1',
  ONBOARDING_SEEN: '@chownow_onboarding_seen_v1',
  RECENT_SEARCHES: '@chownow_recent_searches_v1',
};

export const Storage = {
  async get<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const data = await AsyncStorage.getItem(key);
      if (data === null) return defaultValue;
      return JSON.parse(data) as T;
    } catch (e) {
      console.warn(`[Storage] Failed to read ${key}:`, e);
      return defaultValue;
    }
  },

  async set<T>(key: string, value: T): Promise<boolean> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn(`[Storage] Failed to write ${key}:`, e);
      return false;
    }
  },

  async remove(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (e) {
      console.warn(`[Storage] Failed to remove ${key}:`, e);
      return false;
    }
  },

  async clear(): Promise<boolean> {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (e) {
      console.warn('[Storage] Failed to clear storage:', e);
      return false;
    }
  },
};
