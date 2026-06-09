import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
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

// ─── Home Screen ─────────────────────────────────────────────────────────────
function HomeScreen({ navigation }: any) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMenu();
  }, []);

  async function loadMenu() {
    try {
      const response = await fetch(`${API_BASE}/api/matcha`);
      if (!response.ok) throw new Error('Request failed');

      const data = await response.json();
      const mapped = data.map((item: any) => ({
        id: String(item.id),
        category: item.category,
        name: item.name,
        price: '₱' + item.price,
        desc: item.description,
      }));

      setMenuItems(mapped);
    } catch {
      setError('Could not load menu. Run "npm run server" first, then refresh.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.metaText}>loading menu...</Text>
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
        <Text style={styles.label}>[ screen ]</Text>
        <Text style={styles.heading}>MENU</Text>
        <Text style={styles.subheading}>{menuItems.length} items loaded</Text>
      </View>

      <FlatList
        data={menuItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            activeOpacity={0.6}
            onPress={() => navigation.navigate('Detail', { coffee: item })}
          >
            <Text style={styles.itemLabel}>{item.category}</Text>
            <Text style={styles.itemName}>{item.name}</Text>
            <View style={styles.itemFooter}>
              <Text style={styles.itemPrice}>{item.price}</Text>
              <Text style={styles.itemAction}>view →</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

// ─── Detail Screen ───────────────────────────────────────────────────────────
function DetailScreen({ route, navigation }: any) {
  const { coffee } = route.params;

  return (
    <View style={styles.detailContainer}>
      <Text style={styles.label}>[ detail ]</Text>
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

      <TouchableOpacity
        style={styles.backButton}
        activeOpacity={0.7}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>← back to menu</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────
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
        <Stack.Screen name="Menu" component={HomeScreen} options={{ title: 'MENU' }} />
        <Stack.Screen
          name="Detail" component={DetailScreen} options={{ title: 'DETAIL', headerLeft: () => null}}
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
    marginBottom: 12,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 10,
  },
  itemPrice: {
    fontSize: 14,
    color: '#000',
  },
  itemAction: {
    fontSize: 12,
    color: '#666',
    letterSpacing: 0.5,
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
    marginBottom: 32,
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
});