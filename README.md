# fnshedrink — Matcha Bar Ordering App

A mobile ordering kiosk for a ceremonial matcha bar. Customers browse the menu, build a cart, and place orders; staff manage the menu, track live orders, and generate daily transaction reports — all from one app.

---

## Features

### Customer Side
- Browse a curated menu of matcha drinks (Ceremonial Lattes, Pure Matcha, Frappes, Specials)
- Tap any drink for a full detail page before adding to cart
- Add items to cart with optional per-item special instructions (e.g. "extra sugar, no ice")
- Review and confirm order before submission
- Order summary screen with full item breakdown and total in PHP
- Tablet layout shows the cart inline beside the menu (split view)
- Resume in-progress cart from the home screen

### Staff / Admin Side
- PIN-protected admin panel (re-locks when switching tabs)
- Add, edit, and remove menu items
- Mark items as available or unavailable (unavailable items are hidden from customers)
- Feature popular drinks (float to top of menu with a badge)
- View all pending orders with timestamps, item details, and special instructions
- Mark orders as done
- Completed orders are grouped by date and collapsed by default for a clean view
- Tap a date group to expand its orders
- Generate and save a daily transactions PDF report per date group
- Live badge on the Admin tab showing pending order count

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo ~54 / React Native 0.81 |
| Language | TypeScript 5.9 |
| Routing | Expo Router (file-based) |
| State | React Context API |
| Persistence | AsyncStorage (local, on-device) |
| Print / PDF | expo-print + expo-sharing |
| Build | EAS Build |
| Platforms | Android, iOS |

---

## Project Structure

```
main_app/
├── app/
│   ├── _layout.tsx              # Root Stack — wraps app with context providers
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Bottom tab navigator
│   │   ├── index.tsx            # Home / kiosk welcome screen
│   │   ├── menu.tsx             # Customer menu (1-col phone, 2-col tablet)
│   │   ├── cart.tsx             # Cart screen (phone only)
│   │   └── admin/
│   │       ├── _layout.tsx      # Admin stack + PIN gate
│   │       ├── index.tsx        # Menu management
│   │       ├── orders.tsx       # Order tracking + daily PDF report
│   │       └── edit.tsx         # Add / edit menu item form
│   ├── menu-detail.tsx          # Single drink detail screen
│   └── order-summary.tsx        # Post-order confirmation screen
├── components/
│   └── CartPanel.tsx            # Inline cart sidebar for tablet layout
├── context/
│   ├── MenuContext.tsx          # Menu item state and AsyncStorage persistence
│   ├── CartContext.tsx          # Cart state and AsyncStorage persistence
│   └── OrderContext.tsx         # Order lifecycle, pending count, seed helper
├── constants/
│   ├── layout.ts                # Tablet breakpoint hook (≥768px)
│   └── api.ts                   # API base URL (unused in current build)
├── server/
│   ├── index.js                 # Optional standalone Express API
│   └── data/
│       └── matcha.json          # Seed data (drinks + shop locations)
├── assets/                      # Icons, splash screens, images
├── app.json                     # Expo config (package name, EAS project ID)
└── eas.json                     # EAS Build profiles (preview APK / production AAB)
```

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) 18 or later
- An Android device or emulator (or iOS device / simulator on Mac)

### Installation

```bash
git clone <repo-url>
cd fnshedrink/main_app
npm install
```

### Running in Development

```bash
npx expo start --clear
```

Press `a` for Android emulator, `i` for iOS simulator, or scan the QR code with Expo Go on a physical device.

---

## Building an APK

Builds run in Expo's cloud — no Android Studio required on your machine.

```bash
# One-time setup
npm install -g eas-cli
eas login

# Build a direct-install APK (internal testing)
eas build --platform android --profile preview

# Build an AAB for the Play Store
eas build --platform android --profile production
```

The build link is printed in the terminal when it finishes (~10–15 min). Install the APK directly on any Android device.

> **Note:** Features that use `expo-print` and `expo-sharing` (the daily PDF report) only work on a real device or emulator — not in a browser.

---

## Data Persistence

All menu items, cart contents, and orders are stored locally using **AsyncStorage**. Data survives app restarts but is device-specific — there is no shared backend sync between devices.

---

## Admin Access

The Admin tab is PIN-protected. The PIN is configured in `main_app/app/(tabs)/admin/_layout.tsx` and should be changed before deploying to a shared device.

---

## License

Private project. All rights reserved.
