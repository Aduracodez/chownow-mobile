import React, { createContext, useContext, useEffect, useState } from 'react';
import { PROMOTIONS } from '../data/promotions';
import { Storage, STORAGE_KEYS } from '../services/storage';
import { CartCustomization, CartItem, FoodItem, Promotion } from '../types';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  appliedPromo: Promotion | null;
  restaurantId: string | null;
  restaurantName: string | null;
  addToCart: (
    food: FoodItem,
    quantity: number,
    selectedCustomizations?: CartCustomization[],
    specialInstructions?: string
  ) => { success: boolean; requiresRestaurantSwitch?: boolean; currentRestaurant?: string };
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  confirmSwitchRestaurantAndAdd: (
    food: FoodItem,
    quantity: number,
    selectedCustomizations?: CartCustomization[],
    specialInstructions?: string
  ) => void;
}

const TAX_RATE = 0.08; // 8% sales tax
const DEFAULT_DELIVERY_FEE = 2.99;
const FREE_DELIVERY_THRESHOLD = 35.0;

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedPromo, setAppliedPromo] = useState<Promotion | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from AsyncStorage on startup
  useEffect(() => {
    loadSavedCart();
  }, []);

  // Save cart to AsyncStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      Storage.set(STORAGE_KEYS.CART, { items, appliedPromo });
    }
  }, [items, appliedPromo, isLoaded]);

  const loadSavedCart = async () => {
    try {
      const saved = await Storage.get<{ items: CartItem[]; appliedPromo: Promotion | null } | null>(
        STORAGE_KEYS.CART,
        null
      );
      if (saved && Array.isArray(saved.items)) {
        setItems(saved.items);
        if (saved.appliedPromo) {
          setAppliedPromo(saved.appliedPromo);
        }
      }
    } catch (e) {
      console.warn('Failed to load cart from storage:', e);
    } finally {
      setIsLoaded(true);
    }
  };

  const restaurantId = items.length > 0 ? items[0].food.restaurantId : null;
  const restaurantName = items.length > 0 ? items[0].food.restaurantName : null;

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => sum + item.itemTotal, 0);

  // Calculate delivery fee
  let deliveryFee = 0;
  if (items.length > 0) {
    if (subtotal >= FREE_DELIVERY_THRESHOLD || appliedPromo?.code === 'FREEDEL') {
      deliveryFee = 0;
    } else {
      deliveryFee = DEFAULT_DELIVERY_FEE;
    }
  }

  // Calculate tax
  const tax = Number((subtotal * TAX_RATE).toFixed(2));

  // Calculate discount
  let discount = 0;
  if (appliedPromo && subtotal >= appliedPromo.minOrder) {
    if (appliedPromo.discountPercent) {
      discount = Number(((subtotal * appliedPromo.discountPercent) / 100).toFixed(2));
    } else if (appliedPromo.discountAmount) {
      discount = Math.min(appliedPromo.discountAmount, subtotal);
    }
  }

  const total = Math.max(0, Number((subtotal + deliveryFee + tax - discount).toFixed(2)));

  const buildCartItemId = (
    foodId: string,
    customizations: CartCustomization[] = []
  ): string => {
    const sortedOptions = [...customizations]
      .sort((a, b) => a.choiceId.localeCompare(b.choiceId))
      .map((c) => c.choiceId)
      .join('-');
    return `${foodId}_${sortedOptions}`;
  };

  const calculateItemPrice = (
    basePrice: number,
    customizations: CartCustomization[] = []
  ): number => {
    const optionsSum = customizations.reduce((sum, c) => sum + c.price, 0);
    return basePrice + optionsSum;
  };

  const addToCart = (
    food: FoodItem,
    quantity: number,
    selectedCustomizations: CartCustomization[] = [],
    specialInstructions?: string
  ) => {
    // Check if adding from a different restaurant
    if (items.length > 0 && items[0].food.restaurantId !== food.restaurantId) {
      return {
        success: false,
        requiresRestaurantSwitch: true,
        currentRestaurant: items[0].food.restaurantName,
      };
    }

    const unitPrice = calculateItemPrice(food.price, selectedCustomizations);
    const cartItemId = buildCartItemId(food.id, selectedCustomizations);
    const existingIndex = items.findIndex((i) => i.cartItemId === cartItemId);

    let updated: CartItem[];
    if (existingIndex > -1) {
      const existing = items[existingIndex];
      const newQty = existing.quantity + quantity;
      const updatedItem: CartItem = {
        ...existing,
        quantity: newQty,
        itemTotal: Number((unitPrice * newQty).toFixed(2)),
        specialInstructions: specialInstructions || existing.specialInstructions,
      };
      updated = [...items];
      updated[existingIndex] = updatedItem;
    } else {
      const newItem: CartItem = {
        cartItemId,
        food,
        quantity,
        selectedCustomizations,
        specialInstructions,
        itemTotal: Number((unitPrice * quantity).toFixed(2)),
      };
      updated = [...items, newItem];
    }

    setItems(updated);
    return { success: true };
  };

  const confirmSwitchRestaurantAndAdd = (
    food: FoodItem,
    quantity: number,
    selectedCustomizations: CartCustomization[] = [],
    specialInstructions?: string
  ) => {
    const unitPrice = calculateItemPrice(food.price, selectedCustomizations);
    const cartItemId = buildCartItemId(food.id, selectedCustomizations);
    const newItem: CartItem = {
      cartItemId,
      food,
      quantity,
      selectedCustomizations,
      specialInstructions,
      itemTotal: Number((unitPrice * quantity).toFixed(2)),
    };
    setItems([newItem]);
    setAppliedPromo(null);
  };

  const removeFromCart = (cartItemId: string) => {
    const updated = items.filter((i) => i.cartItemId !== cartItemId);
    setItems(updated);
    if (updated.length === 0) {
      setAppliedPromo(null);
    }
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    const updated = items.map((item) => {
      if (item.cartItemId === cartItemId) {
        const unitPrice = calculateItemPrice(item.food.price, item.selectedCustomizations);
        return {
          ...item,
          quantity,
          itemTotal: Number((unitPrice * quantity).toFixed(2)),
        };
      }
      return item;
    });
    setItems(updated);
  };

  const clearCart = () => {
    setItems([]);
    setAppliedPromo(null);
    Storage.remove(STORAGE_KEYS.CART);
  };

  const applyPromoCode = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const promo = PROMOTIONS.find((p) => p.code.toUpperCase() === cleanCode);

    if (!promo) {
      return { success: false, message: 'Invalid promo code. Try CHOWWELCOME or FREEDEL' };
    }

    if (subtotal < promo.minOrder) {
      return {
        success: false,
        message: `Minimum order for this code is $${promo.minOrder.toFixed(2)}`,
      };
    }

    setAppliedPromo(promo);
    return { success: true, message: `Promo applied: ${promo.title}` };
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        deliveryFee,
        tax,
        discount,
        total,
        appliedPromo,
        restaurantId,
        restaurantName,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyPromoCode,
        removePromoCode,
        confirmSwitchRestaurantAndAdd,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
