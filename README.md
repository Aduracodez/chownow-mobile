# ChowNow 🍔🍕

> A modern, full-featured food delivery mobile application built with React Native, Expo, TypeScript, and Expo Router.

[![Expo](https://img.shields.io/badge/Expo-SDK%2058-000020.svg?style=flat&logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.88-61DAFB.svg?style=flat&logo=react)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

ChowNow is an on-demand food delivery mobile application designed for iOS and Android. It features curated multi-cuisine discovery, dynamic dish customization with real-time price calculations, persistent shopping cart management, promo code validation, and a live 5-milestone order tracking lifecycle.

---

## Architecture & Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) with [Expo SDK 58](https://expo.dev/)
- **Routing**: [Expo Router v58](https://docs.expo.dev/router/introduction/) (File-based routing with typed routes)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict mode enabled)
- **State Management**: React Context API (`AuthContext`, `CartContext`, `FavoritesContext`, `OrderContext`)
- **Persistence**: `@react-native-async-storage/async-storage` for local cache and cart state
- **Backend / Auth**: `@supabase/supabase-js` client integration with offline resilience
- **Icons**: `@expo/vector-icons` (Ionicons)
- **UI & Layout**: Mobile-first responsive layouts with platform-adaptive safe areas and custom shadows

---

## Features

### 1. Discovery & Search
- **Location Selector**: Dynamic delivery address dropdown with quick address switcher modal.
- **Search & Auto-filter**: Fast keyword search across restaurants, cuisines, and dish ingredients.
- **8 Cuisines**: African Food, Burgers, Pizza, Chicken, Chinese, Seafood, Desserts, and Drinks.
- **African Specialties**: Dedicated section highlighting authentic West African party jollof, beef suya, egusi, and grills.
- **Smart Filters**: Filter restaurants by minimum rating (4.8+), free delivery, delivery speed (<25m), and price range.

### 2. Menu & Dish Customization
- **Rich Menu Explorer**: In-menu category tabs and dish search within restaurant profiles.
- **Dynamic Options**: Required single-choice options (protein choices, crust types) and optional multi-select add-ons with real-time price updates.
- **Special Instructions**: Direct kitchen prep notes input.
- **Restaurant Conflict Guard**: Gracefully warns customers when adding items from a different kitchen.

### 3. Shopping Cart & Vouchers
- **Local Persistence**: Cart state and customized items survive app restarts.
- **Free Delivery Gauge**: Real-time progress bar toward the $35 free delivery threshold.
- **Voucher Engine**: Validates promo codes and deducts discounts:
  - `CHOWWELCOME`: 30% off orders over $25
  - `FREEDEL`: Free delivery on orders over $20
  - `AFRICACHOW`: $8 off African cuisine platters
  - `BURGERFEST`: 20% off gourmet burgers
  - `TASTY5`: $5 off desserts & drinks
- **Transparent Bill**: Line-item breakdown of subtotal, delivery fee, 8% tax, and discounts.

### 4. Checkout & Payment
- Delivery address confirmation with custom drop-off notes (gate code, concierge).
- Multi-payment support: Apple Pay, Credit/Debit card authorization, ChowNow Cash wallet, and Cash on Delivery.

### 5. Live Order Tracking
- **Milestone Progress**: Real-time 5-stage delivery pipeline:
  1. `Order Placed`
  2. `Kitchen Confirmed`
  3. `Preparing Food`
  4. `Rider Picked Up`
  5. `Delivered`
- **Route Visualization**: Visual dispatch corridor (Kitchen ➔ Rider ➔ Customer).
- **Courier Interaction**: Dedicated driver card with direct call and message shortcuts.
- **Itemized Receipts**: Digital receipt breakdown with order timestamps.

---

## Project Structure

```
mobile_app/
├── app/                        # Expo Router file-based route definitions
│   ├── _layout.tsx             # Root layout with providers & safe area configuration
│   ├── (tabs)/                 # Main bottom tab bar (5 tabs)
│   │   ├── _layout.tsx         # Bottom tab navigator
│   │   ├── index.tsx           # Home dashboard
│   │   ├── explore.tsx         # Restaurant directory & filter engine
│   │   ├── orders.tsx          # Active and past order history
│   │   ├── favourites.tsx      # Saved restaurants and dishes
│   │   └── profile.tsx         # User profile, wallet, addresses & settings
│   ├── auth/                   # Authentication screens
│   │   ├── login.tsx           # Sign-in & guest entry
│   │   ├── register.tsx        # Account registration
│   │   └── forgot-password.tsx # Password recovery
│   ├── restaurant/
│   │   └── [id].tsx            # Restaurant menu & reviews
│   ├── food/
│   │   └── [id].tsx            # Dish customization modal
│   ├── cart.tsx                # Shopping cart & voucher application
│   ├── checkout.tsx            # Delivery & payment selection
│   ├── order-tracking/
│   │   └── [id].tsx            # Live order tracker
│   ├── splash.tsx              # Splash launch screen
│   ├── onboarding.tsx          # Introductory walkthrough
│   └── modal.tsx               # About ChowNow sheet
├── src/
│   ├── components/             # Reusable UI primitives (Buttons, Cards, Badges, Search)
│   ├── constants/              # Theme tokens (Colors, Spacing, Shadows, Radius)
│   ├── context/                # Context providers (Auth, Cart, Orders, Favorites)
│   ├── data/                   # Seed data (12 restaurants, 43 dishes, categories)
│   ├── services/               # Storage and Supabase API abstractions
│   └── types/                  # TypeScript interface definitions
├── app.json                    # Expo application configuration
└── package.json
```

---

## Getting Started

### Prerequisites
- Node.js (v18 or newer)
- npm or yarn
- Expo Go app on your iOS or Android mobile device (optional, for physical device testing)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Aduracodez/chownow-mobile.git
   cd chownow-mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Expo development server:
   ```bash
   npx expo start
   ```

### Running on Devices

- **iPhone / iOS Device**: Open the Camera app on your iPhone and scan the terminal QR code. Tap the link to open in **Expo Go**.
- **Android Device**: Scan the QR code using the **Expo Go** application.
- **iOS Simulator**: Press `i` in the terminal.
- **Android Emulator**: Press `a` in the terminal.

---

## Configuration

### Environment Variables (Optional)
To connect your own Supabase project, create a `.env` file in the root directory:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

When no environment variables are provided, ChowNow operates in offline-first local mode via AsyncStorage.

---

## Quality Checks

Run TypeScript compiler check:
```bash
npx tsc --noEmit
```

Export and verify production bundles:
```bash
npx expo export -p ios
npx expo export -p android
```

---

## License

This project is open source and available under the [MIT License](LICENSE).
