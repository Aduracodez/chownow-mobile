export type FoodCategory =
  | 'Burgers'
  | 'Pizza'
  | 'African Food'
  | 'Chinese'
  | 'Chicken'
  | 'Seafood'
  | 'Desserts'
  | 'Drinks';

export interface CategoryItem {
  id: string;
  name: FoodCategory;
  icon: string; // Ionicons / MaterialCommunityIcons name
  image: string;
  description: string;
}

export interface CustomizationChoice {
  id: string;
  name: string;
  price: number;
}

export interface CustomizationGroup {
  id: string;
  title: string;
  required: boolean;
  maxSelect?: number;
  options: CustomizationChoice[];
}

export interface FoodItem {
  id: string;
  restaurantId: string;
  restaurantName: string;
  name: string;
  category: FoodCategory;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  ratingCount: number;
  calories?: number;
  preparationTime: string;
  isPopular?: boolean;
  isRecommended?: boolean;
  isSpicy?: boolean;
  isVegetarian?: boolean;
  ingredients: string[];
  customizations?: CustomizationGroup[];
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  secondaryCuisine?: string;
  rating: number;
  ratingCount: number;
  deliveryTime: string; // e.g. "20-30 min"
  deliveryFee: number; // e.g. 2.99, or 0
  minOrder: number;
  distance: string; // e.g. "1.4 km"
  coverImage: string;
  logoImage: string;
  isOpen: boolean;
  openingHours: string;
  address: string;
  categories: FoodCategory[];
  featuredMenu?: string[];
  isTopRated?: boolean;
  hasFreeDelivery?: boolean;
  discountBadge?: string;
  description: string;
}

export interface CartCustomization {
  groupId: string;
  groupTitle: string;
  choiceId: string;
  choiceName: string;
  price: number;
}

export interface CartItem {
  cartItemId: string; // unique ID generated for this cart entry (id + selected options)
  food: FoodItem;
  quantity: number;
  selectedCustomizations: CartCustomization[];
  specialInstructions?: string;
  itemTotal: number;
}

export interface DeliveryAddress {
  id: string;
  label: 'Home' | 'Work' | 'Other';
  street: string;
  city: string;
  apartment?: string;
  deliveryNotes?: string;
  isDefault: boolean;
}

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'picked_up'
  | 'delivered'
  | 'cancelled';

export interface OrderStatusHistory {
  status: OrderStatus;
  time: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface OrderRider {
  name: string;
  phone: string;
  photo: string;
  rating: number;
  vehicle: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  restaurantId: string;
  restaurantName: string;
  restaurantImage: string;
  restaurantPhone: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  promoCode?: string;
  deliveryAddress: DeliveryAddress;
  contactPhone: string;
  deliveryInstructions?: string;
  paymentMethod: 'apple_pay' | 'card' | 'cash' | 'wallet';
  status: OrderStatus;
  estimatedDeliveryTime: string;
  createdAt: string;
  timeline: OrderStatusHistory[];
  rider?: OrderRider;
}

export interface Promotion {
  id: string;
  title: string;
  subtitle: string;
  code: string;
  discountPercent?: number;
  discountAmount?: number;
  minOrder: number;
  imageUrl: string;
  badge: string;
  bgColor: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar: string;
  isGuest: boolean;
  defaultAddressId?: string;
  walletBalance: number;
}
