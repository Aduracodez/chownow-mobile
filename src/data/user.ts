import { DeliveryAddress, UserProfile } from '../types';

export const DEFAULT_USER: UserProfile = {
  id: 'usr_8921a4f0',
  fullName: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  phone: '+1 (555) 349-2819',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  isGuest: false,
  walletBalance: 45.0,
  defaultAddressId: 'addr-1',
};

export const DEFAULT_ADDRESSES: DeliveryAddress[] = [
  {
    id: 'addr-1',
    label: 'Home',
    street: '142 Palm Boulevard, Apt 4B',
    city: 'Metropolis',
    apartment: 'Floor 4, Apt 4B',
    deliveryNotes: 'Ring bell 4B or leave with door concierge.',
    isDefault: true,
  },
  {
    id: 'addr-2',
    label: 'Work',
    street: '77 Silicon Innovation Way',
    city: 'Metropolis',
    apartment: 'Floor 8, Tech Tower',
    deliveryNotes: 'Call upon arrival; rider can enter ground lobby.',
    isDefault: false,
  },
];
