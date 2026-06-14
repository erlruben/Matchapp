# fnshedrink — Matcha Bar Ordering App

A mobile and web ordering kiosk for a ceremonial matcha bar. Customers browse the menu, build a cart, and place orders; staff manage the menu and track orders from a dedicated admin panel — all from one app.

---

## Purpose

fnshedrink removes the friction of counter-based ordering by letting customers place their own orders at a kiosk or on their phone. Staff get real-time visibility into incoming orders and full control over the menu without needing a separate backend system.

---

## Features

### Customer Side
- Browse a curated menu of matcha drinks (Ceremonial Lattes, Pure Matcha, Frappes, Specials)
- Add items to cart with optional per-item special instructions (e.g. "extra sugar, no ice")
- Review and confirm order before submission
- Order summary screen with full item breakdown and total in PHP
- Tablet layout shows cart inline beside the menu

### Staff / Admin Side
- Add, edit, and remove menu items
- Mark items as available or unavailable (unavailable items are hidden from customers)
- Feature popular drinks (they surface at the top of the menu with a badge)
- View all pending orders with timestamps and item details
- Mark orders as done; completed orders are archived separately
- Live badge on the Admin tab showing pending order count

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Expo](https://expo.dev) ~54 / React Native 0.81 |
| Language | TypeScript 5.9 |
| Routing | Expo Router (file-based, similar to Next.js) |
| UI | React Native (cross-platform native UI) |
| State | React Context API |
| Persistence | AsyncStorage (local, on-device) |
| Animation | React Native Reanimated |
| Backend (optional) | Express 4 + CORS |
| Platforms | iOS, Android, Web |

---

## Project Structure

```
fnshedrink_app/
├── app/
│   ├── _layout.tsx           # Root layout — wraps app with context providers
│   ├── (tabs)/
│   │   ├── _layout.tsx       # Bottom tab navigation
│   │   ├── index.tsx         # Home / welcome screen
│   │   ├── menu.tsx          # Customer menu screen
│   │   ├── cart.tsx          # Cart screen (phone only)
│   │   └── admin/
│   │       ├── _layout.tsx   # Admin stack navigator
│   │       ├── index.tsx     # Admin menu management
│   │       ├── orders.tsx    # Admin order tracking
│   │       └── edit.tsx      # Add / edit menu item form
│   ├── menu-detail.tsx       # Single drink detail screen
│   └── order-summary.tsx     # Post-order confirmation screen
├── components/
│   └── CartPanel.tsx         # Sidebar cart for tablet layout
├── context/
│   ├── MenuContext.tsx       # Menu item state and persistence
│   ├── CartContext.tsx       # Cart state and persistence
│   └── OrderContext.tsx      # Order lifecycle and pending count
├── constants/
│   └── layout.ts             # Tablet breakpoint hook (768px)
├── server/
│   ├── index.js              # Optional Express API server
│   └── data/
│       └── matcha.json       # Seed data (drinks + shop locations)
└── assets/                   # Icons, splash screens, images
```

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) 18 or later
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- For iOS: Xcode (Mac only)
- For Android: Android Studio with an emulator, or a physical device with the Expo Go app

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd fnshedrink_app

# Install dependencies
npm install
```

### Running the App

```bash
# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run in browser
npm run web
```

After starting, scan the QR code in the terminal with the **Expo Go** app on your phone, or press `a` / `i` / `w` to open on Android / iOS / web.

### Optional: Start the Backend Server

The app ships with local seed data and works fully offline. If you want to use the Express API instead:

```bash
npm run server
# Runs at http://localhost:3000
# GET /api/matcha        — all drinks
# GET /api/shops         — nearby shop locations
# GET /api/shops/:id/menu — menu for a specific shop
```

---

## Usage Guide

### Placing an Order (Customer)
1. Open the app — you land on the **Home** screen.
2. Tap **Start ordering** to go to the **Menu**.
3. Tap any drink to see its detail page, then **Add to cart**.
4. Tap the **Cart** tab (or use the inline panel on tablet) to review your items.
5. Add special instructions to any item if needed.
6. Tap **Confirm order** to submit.
7. Show the **Order Summary** screen at the counter for confirmation.

### Managing the Menu (Staff)
1. Tap the **Admin** tab.
2. Use **Add new item** to create a drink (name, category, price, description).
3. Tap **Edit** on any item to update its details.
4. Toggle **Feature** to make a drink appear at the top of the customer menu.
5. Toggle **Available / Unavailable** to show or hide a drink from customers.
6. Tap **Remove** to permanently delete an item.

### Tracking Orders (Staff)
1. In the **Admin** tab, tap **View orders** (badge shows pending count).
2. **Pending** orders show time received, items, special instructions, and total.
3. Tap **Mark as done** when a drink is ready.
4. Completed orders move to the **Completed** section.
5. Tap **Clear all** to remove completed orders from the list.

---

## Responsive Layout

| Device | Cart | Menu columns | CartPanel |
|---|---|---|---|
| Phone (< 768px) | Separate Cart tab | 1 column | Hidden |
| Tablet (≥ 768px) | Hidden Cart tab | 2 columns | Inline on right |

---

## Data Persistence

All menu items, cart contents, and orders are stored locally using **AsyncStorage**. Data survives app restarts but is device-specific — there is no shared backend sync between devices in the default configuration.

---

## Linting

```bash
npm run lint
```

---

## License

Private project. All rights reserved.
