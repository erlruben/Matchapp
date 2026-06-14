import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationIndependentTree } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { API_BASE } from '../../constants/api';

type MenuItem = {
  id: string;
  category: string;
  name: string;
  price: string;
  desc: string;
};

const Stack = createStackNavigator();

function MenuScreen({ navigation }: any) {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [favorites, setFavorites] = useState<MenuItem[]>([]);
  const [favoritesLoaded, setFavoritesLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastItem, setToastItem] = useState<string>('');

  useEffect(() => {
    loadMenu();
    loadFavorites();
  }, []);

  useEffect(() => {
    async function saveFavorites() {
      if (!favoritesLoaded) return;

      try {
        await AsyncStorage.setItem('matchaFavorites', JSON.stringify(favorites));
      } catch {
        // Favorites remain in memory if local storage is unavailable.
      }
    }

    saveFavorites();
  }, [favorites, favoritesLoaded]);

  async function loadMenu() {
    try {
      const response = await fetch(`${API_BASE}/api/matcha`);
      if (!response.ok) throw new Error('Request failed');

      const data = await response.json();
      const mapped = data.map((item: any) => ({
        id: String(item.id),
        category: item.category,
        name: item.name,
        price: 'PHP ' + item.price,
        desc: item.description,
      }));

      setMenuItems(mapped);
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
      const existingRaw = await AsyncStorage.getItem('cartItems');
      const existingItems = existingRaw ? JSON.parse(existingRaw) : [];
      
      // Add new item with unique ID
      const newItem = {
        ...item,
        id: `${item.id}-${Date.now()}`, // Ensure unique ID for multiple same items
      };
      
      const updatedItems = [...existingItems, newItem];
      await AsyncStorage.setItem('cartItems', JSON.stringify(updatedItems));
      
      // Show toast
      setToastItem(item.name);
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2000);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  }

  function isFavorite(id: string) {
    return favorites.some((item) => item.id === id);
  }

  function toggleFavorite(item: MenuItem) {
    if (isFavorite(item.id)) {
      setFavorites(favorites.filter((favorite) => favorite.id !== item.id));
      return;
    }

    setFavorites([...favorites, item]);
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

  return (
    <View style={styles.container}>
      <View style={styles.headerBlock}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.label}>unfnshed</Text>
            <Text style={styles.heading}>MENU</Text>
          </View>
        </View>
        <Text style={styles.subheading}>{menuItems.length} drinks available</Text>
        <Text style={styles.subheading}>{favorites.length} favorites saved</Text>
      </View>

      <FlatList
        data={[...favorites, ...menuItems.filter(item => !isFavorite(item.id))]}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <TouchableOpacity activeOpacity={0.6} onPress={() => navigation.navigate('Detail', { coffee: item })}>
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

function DetailScreen({ route, navigation }: any) {
  const router = useRouter();
  const { coffee } = route.params;
  const [toastVisible, setToastVisible] = useState(false);

  async function addToCart() {
    try {
      const existingRaw = await AsyncStorage.getItem('cartItems');
      const existingItems = existingRaw ? JSON.parse(existingRaw) : [];
      
      // Add new item with unique ID
      const newItem = {
        ...coffee,
        id: `${coffee.id}-${Date.now()}`, // Ensure unique ID for multiple same items
      };
      
      const updatedItems = [...existingItems, newItem];
      await AsyncStorage.setItem('cartItems', JSON.stringify(updatedItems));
      
      // Show toast
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2000);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  }

  return (
    <View style={styles.detailContainer}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.label}>unfnshed order</Text>
          <Text style={styles.detailCategory}>{coffee.category}</Text>
        </View>
      </View>

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
        <Text style={styles.primaryButtonText}>to cart</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        activeOpacity={0.7}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>&lt;- back to menu</Text>
      </TouchableOpacity>
      
      {toastVisible && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{coffee.name} added to cart ✓</Text>
        </View>
      )}
    </View>
  );
}

export default function App() {
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  profileButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  profileButtonText: {
    color: '#000',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'lowercase',
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
  favoritesBlock: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#bbb',
    padding: 16,
    marginTop: 8,
  },
  favoriteHeading: {
    fontSize: 10,
    color: '#999',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  favoriteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  favoriteName: {
    flex: 1,
    color: '#000',
    fontSize: 14,
    paddingRight: 12,
  },
  favoriteActions: {
    flexDirection: 'row',
    gap: 12,
  },
  addLink: {
    color: '#000',
    fontSize: 12,
    textDecorationLine: 'underline',
    textTransform: 'lowercase',
  },
  removeLink: {
    color: '#666',
    fontSize: 12,
    textDecorationLine: 'underline',
    textTransform: 'lowercase',
  },
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
