import React, { createContext, useContext, useEffect, useState } from 'react';
import { DEFAULT_ADDRESSES, DEFAULT_USER } from '../data/user';
import { Storage, STORAGE_KEYS } from '../services/storage';
import { SupabaseService } from '../services/supabase';
import { DeliveryAddress, UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isGuest: boolean;
  addresses: DeliveryAddress[];
  selectedAddress: DeliveryAddress | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
  setSelectedAddress: (address: DeliveryAddress) => void;
  addAddress: (address: Omit<DeliveryAddress, 'id'>) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(DEFAULT_USER);
  const [addresses, setAddresses] = useState<DeliveryAddress[]>(DEFAULT_ADDRESSES);
  const [selectedAddress, setSelectedAddressState] = useState<DeliveryAddress | null>(
    DEFAULT_ADDRESSES[0] || null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const storedUser = await Storage.get<UserProfile | null>(STORAGE_KEYS.USER, DEFAULT_USER);
      const storedAddresses = await Storage.get<DeliveryAddress[]>(
        STORAGE_KEYS.ADDRESSES,
        DEFAULT_ADDRESSES
      );

      if (storedUser) {
        setUser(storedUser);
      }
      if (storedAddresses && storedAddresses.length > 0) {
        setAddresses(storedAddresses);
        const defaultAddr = storedAddresses.find((a) => a.isDefault) || storedAddresses[0];
        setSelectedAddressState(defaultAddr);
      }
    } catch (e) {
      console.warn('Failed to load auth session:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await SupabaseService.signIn(email, password);
      if (res.error) {
        return { success: false, error: res.error.message };
      }
      const loggedUser: UserProfile = {
        id: res.data.user?.id || 'usr-' + Date.now(),
        fullName: res.data.user?.user_metadata?.full_name || email.split('@')[0],
        email: email,
        phone: '+1 (555) 789-0123',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        isGuest: false,
        walletBalance: 50.0,
      };
      setUser(loggedUser);
      await Storage.set(STORAGE_KEYS.USER, loggedUser);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Login failed' };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await SupabaseService.signUp(email, password, name);
      if (res.error) {
        return { success: false, error: res.error.message };
      }
      const newUser: UserProfile = {
        id: res.data.user?.id || 'usr-' + Date.now(),
        fullName: name,
        email: email,
        phone: '+1 (555) 000-1122',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
        isGuest: false,
        walletBalance: 25.0, // welcome bonus
      };
      setUser(newUser);
      await Storage.set(STORAGE_KEYS.USER, newUser);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Registration failed' };
    }
  };

  const loginAsGuest = () => {
    const guestUser: UserProfile = {
      id: 'guest-' + Date.now(),
      fullName: 'Chow Guest',
      email: 'guest@chownow.app',
      phone: '+1 (555) 000-0000',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
      isGuest: true,
      walletBalance: 0,
    };
    setUser(guestUser);
    Storage.set(STORAGE_KEYS.USER, guestUser);
  };

  const logout = async () => {
    await SupabaseService.signOut();
    setUser(null);
    await Storage.remove(STORAGE_KEYS.USER);
  };

  const setSelectedAddress = (address: DeliveryAddress) => {
    setSelectedAddressState(address);
  };

  const addAddress = (newAddr: Omit<DeliveryAddress, 'id'>) => {
    const created: DeliveryAddress = {
      ...newAddr,
      id: 'addr-' + Date.now(),
    };
    const updated = [created, ...addresses];
    setAddresses(updated);
    if (created.isDefault || !selectedAddress) {
      setSelectedAddressState(created);
    }
    Storage.set(STORAGE_KEYS.ADDRESSES, updated);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    Storage.set(STORAGE_KEYS.USER, updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isGuest: Boolean(user?.isGuest),
        addresses,
        selectedAddress,
        login,
        register,
        loginAsGuest,
        logout,
        setSelectedAddress,
        addAddress,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
