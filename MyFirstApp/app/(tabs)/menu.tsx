import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationIndependentTree } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { API_BASE } from '../../constants/api';

// ─── Types ───────────────────────────────────────────────────────────────────

type MenuItem = {
  id: string;
  category: string;
  name: string;
  price: string;
  desc: string;
};

const Stack = createStackNavigator();

// ─── Shared Cart Utility ─────────────────────────────────────────────────────

// Appends one item to the cart in AsyncStorage. ID is stamped with Date.now()
// so the same drink can appear multiple times as separate entries.
async function pushToCart(item: MenuItem): Promise<void> {
  const raw = await AsyncStorage.getItem('cartItems');
  const existing: MenuItem[] = raw ? JSON.parse(raw) : [];
  const stamped = { ...item, id: `${item.id}-${Date.now()}` };
  await AsyncStorage.setItem('cartItems', JSON.stringify([...existing, stamped]));
}

// ─── Menu Screen ─────────────────────────────────────────────────────────────

function MenuScreen({ navigation }: { navigation: any }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [favorites, setFavorites] = useState<MenuItem[]>([]);
  const [favoritesLoaded, setFavoritesLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastItem, setToastItem] = useState('');

  // Tracks whether favorites have been intentionally changed (vs. just loaded from storage).
  const favoritesInitialized = useRef(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadMenu();
    loadFavorites();
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  // Persist favorites only on intentional changes — skip the write that fires when
  // favoritesLoaded first becomes true (we'd just be writing what we read).
  useEffect(() => {
    if (!favoritesLoaded) return;
    if (!favoritesInitialized.current) {
      favoritesInitialized.current = true;
      return;
    }
    AsyncStorage.setItem('matchaFavorites', JSON.stringify(favorites)).catch(() => {});
  }, [favorites, favoritesLoaded]);

  async function loadMenu() {
    try {
      const response = await fetch(`${API_BASE}/api/matcha`);
      if (!response.ok) throw new Error('Request failed');
      const data = await response.json();
      setMenuItems(
        data.map((item: any) => ({
          id: String(item.id),
          category: item.category,
          name: item.name,
          price: `PHP ${item.price}`,
          desc: item.description,
        }))
      );
    } catch {
      setError('Could not load menu. Run "npm run server" first, then refresh.');
    } finally {
      setLoading(false);
    }
  }

  async function loadFavorites() {
    try {
      const saved = await AsyncStorage.getItem('matchaFavorites');
      if (saved) setFavorites(JSON.parse(saved));
    } catch {
      setFavorites([]);
    } finally {
      setFavoritesLoaded(true);
    }
  }

  async function addToCart(item: MenuItem) {
    try {
      await pushToCart(item);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      setToastItem(item.name);
      setToastVisible(true);
      toastTimer.current = setTimeout(() => setToastVisible(false), 2000);
    } catch {
      // Cart write failed; user can try again.
    }
  }

  function isFavorite(id: string) {
    return favorites.some((f) => f.id === id);
  }

  function toggleFavorite(item: MenuItem) {
    setFavorites((prev) =>
      isFavorite(item.id) ? prev.filter((f) => f.id !== item.id) : [...prev, item]
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.metaText}>loading unfnshed menu...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <View style={styles.errorBox}>
          <Text style={styles.errorLabel}>[ error ]</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  // Favorites float to the top; remaining items follow in server order.
  const listData = [...favorites, ...menuItems.filter((item) => !isFavorite(item.id))];

  return (
    <View style={styles.container}>
      <View style={styles.headerBlock}>
        <Text style={styles.label}>unfnshed</Text>
        <Text style={styles.heading}>MENU</Text>
        <Text style={styles.subheading}>
          {menuItems.length} drinks available · {favorites.length} saved
        </Text>
      </View>

      <FlatList
        data={listData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => navigation.navigate('Detail', { coffee: item })}
            >
              <Text style={styles.itemLabel}>{item.category}</Text>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDesc}>{item.desc}</Text>
            </TouchableOpacity>

            <View style={styles.itemFooter}>
              <Text style={styles.itemPrice}>{item.price}</Text>
              <View style={styles.itemActions}>
                <TouchableOpacity
                  style={[styles.favoriteButton, isFavorite(item.id) && styles.favoriteButtonActive]}
                  onPress={() => toggleFavorite(item)}
                >
                  <Text
                    style={[
                      styles.favoriteButtonText,
                      isFavorite(item.id) && styles.favoriteButtonTextActive,
                    ]}
                  >
                    {isFavorite(item.id) ? 'saved' : 'favorite'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cartButton} onPress={() => addToCart(item)}>
                  <Text style={styles.cartButtonText}>to cart</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      {toastVisible && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastItem} added to cart ✓</Text>
        </View>
      )}
    </View>
  );
}

// ─── Detail Screen ───────────────────────────────────────────────────────────

function DetailScreen({ route, navigation }: { route: any; navigation: any }) {
  const { coffee } = route.params as { coffee: MenuItem };
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  async function addToCart() {
    try {
      await pushToCart(coffee);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      setToastVisible(true);
      toastTimer.current = setTimeout(() => setToastVisible(false), 2000);
    } catch {
      // Cart write failed; user can try again.
    }
  }

  return (
    <View style={styles.detailContainer}>
      <Text style={styles.label}>unfnshed order</Text>
      <Text style={styles.detailCategory}>{coffee.category}</Text>
      <Text style={styles.detailName}>{coffee.name}</Text>

      <View style={styles.priceBox}>
        <Text style={styles.priceLabel}>price</Text>
        <Text style={styles.detailPrice}>{coffee.price}</Text>
      </View>

      <View style={styles.descBox}>
        <Text style={styles.descLabel}>description</Text>
        <Text style={styles.detailDesc}>{coffee.desc}</Text>
      </View>

      <TouchableOpacity style={styles.primaryButton} activeOpacity={0.7} onPress={addToCart}>
        <Text style={styles.primaryButtonText}>add to cart</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        activeOpacity={0.7}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>← back to menu</Text>
      </TouchableOpacity>

      {toastVisible && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{coffee.name} added to cart ✓</Text>
        </View>
      )}
    </View>
  );
}

// ─── Tab Export ──────────────────────────────────────────────────────────────

export default function MenuTab() {
  return (
    <NavigationIndependentTree>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#fff',
            borderBottomWidth: 1,
            borderBottomColor: '#000',
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: '#000',
          headerTitleStyle: { fontWeight: '400', letterSpacing: 2, fontSize: 13 },
        }}
      >
        <Stack.Screen name="Menu" component={MenuScreen} options={{ title: 'UNFNSHED MENU' }} />
        <Stack.Screen
          name="Detail"
          component={DetailScreen}
          options={{ title: 'ORDER', headerLeft: () => null }}
        />
      </Stack.Navigator>
    </NavigationIndependentTree>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  metaText: {
    marginTop: 12,
    fontSize: 12,
    color: '#666',
    letterSpacing: 1,
    textTransform: 'lowercase',
  },
  errorBox: {
    borderWidth: 1,
    borderColor: '#000',
    borderStyle: 'dashed',
    padding: 20,
    width: '100%',
  },
  errorLabel: {
    fontSize: 11,
    color: '#666',
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: 'lowercase',
  },
  errorText: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerBlock: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  label: {
    fontSize: 11,
    color: '#999',
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: 'lowercase',
  },
  heading: {
    fontSize: 28,
    fontWeight: '300',
    color: '#000',
    letterSpacing: 4,
  },
  subheading: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  list: {
    padding: 20,
    gap: 12,
  },
  item: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 16,
    backgroundColor: '#fff',
  },
  itemLabel: {
    fontSize: 10,
    color: '#999',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000',
    marginBottom: 8,
  },
  itemDesc: {
    color: '#444',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 10,
    gap: 12,
  },
  itemPrice: {
    fontSize: 14,
    color: '#000',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  favoriteButton: {
    borderWidth: 1,
    borderColor: '#000',
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 66,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButtonActive: {
    backgroundColor: '#000',
  },
  favoriteButtonText: {
    color: '#000',
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'lowercase',
  },
  favoriteButtonTextActive: {
    color: '#fff',
  },
  cartButton: {
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#000',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  cartButtonText: {
    color: '#fff',
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'lowercase',
  },
  // Detail screen
  detailContainer: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  detailCategory: {
    fontSize: 11,
    color: '#999',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  detailName: {
    fontSize: 26,
    fontWeight: '300',
    color: '#000',
    letterSpacing: 1,
    marginBottom: 24,
  },
  priceBox: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 16,
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 10,
    color: '#999',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  detailPrice: {
    fontSize: 20,
    color: '#000',
    fontWeight: '300',
  },
  descBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    padding: 16,
    marginBottom: 16,
  },
  descLabel: {
    fontSize: 10,
    color: '#999',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  detailDesc: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  primaryButton: {
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#000',
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'lowercase',
  },
  backButton: {
    borderWidth: 1,
    borderColor: '#000',
    paddingVertical: 14,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#000',
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'lowercase',
  },
  toast: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  toastText: {
    color: '#fff',
    fontSize: 12,
    letterSpacing: 0.5,
    textAlign: 'center',
    textTransform: 'lowercase',
  },
});
