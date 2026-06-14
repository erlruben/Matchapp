import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useCallback, useState, useEffect } from 'react';
import { useRouter, useFocusEffect as useExpoFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationIndependentTree, useFocusEffect } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

type CartItem = {
  id: string;
  category: string;
  name: string;
  price: string;
  desc: string;
  note?: string;
  expandedNote?: boolean;
};

const Stack = createStackNavigator();

function CartScreen({ navigation }: any) {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const [notes, setNotes] = useState<{ [key: string]: string }>({});

  const loadCart = useCallback(async () => {
    try {
      // Add delay to ensure AsyncStorage has persisted the data
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const itemsRaw = await AsyncStorage.getItem('cartItems');
      const notesRaw = await AsyncStorage.getItem('cartNotes');

      if (itemsRaw) {
        setCartItems(JSON.parse(itemsRaw));
      } else {
        setCartItems([]);
      }

      if (notesRaw) {
        setNotes(JSON.parse(notesRaw));
      } else {
        setNotes({});
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
      setCartItems([]);
      setNotes({});
    }
  }, []);

  // Refresh cart whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadCart();
      return () => {};
    }, [loadCart])
  );

  // Also refresh immediately on mount
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  async function updateNote(itemId: string, noteText: string) {
    const updatedNotes = { ...notes, [itemId]: noteText };
    setNotes(updatedNotes);
    
    try {
      await AsyncStorage.setItem('cartNotes', JSON.stringify(updatedNotes));
    } catch {
      // Keep the note visible so the user can retry.
    }
  }

  async function confirmAllOrders() {
    try {
      await AsyncStorage.setItem('orderItems', JSON.stringify(cartItems));
      await AsyncStorage.setItem('orderNotes', JSON.stringify(notes));
    } catch {
      // The order can still be reviewed even if notes cannot be stored.
    }

    navigation.navigate('OrderSummary', { items: cartItems, notes });
  }

  async function removeItem(itemId: string) {
    const updated = cartItems.filter(item => item.id !== itemId);
    setCartItems(updated);
    
    const updatedNotes = { ...notes };
    delete updatedNotes[itemId];
    setNotes(updatedNotes);

    try {
      await AsyncStorage.setItem('cartItems', JSON.stringify(updated));
      await AsyncStorage.setItem('cartNotes', JSON.stringify(updatedNotes));
    } catch {
      // Keep items in memory
    }
  }

  if (cartItems.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.label}>unfnshed</Text>
            <Text style={styles.title}>CART</Text>
          </View>
        </View>

        <View style={styles.emptyBox}>
          <Text style={styles.placeholderLabel}>status</Text>
          <Text style={styles.placeholderText}>choose a drink from the menu to start an order</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={() => router.push({ pathname: '/(tabs)/menu' })}>
          <Text style={styles.buttonText}>open menu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={true}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.label}>unfnshed</Text>
          <Text style={styles.title}>CART</Text>
        </View>
      </View>

      <Text style={styles.itemCountLabel}>{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in cart</Text>

      {cartItems.map((item) => (
        <View key={item.id} style={styles.card}>
          <View style={styles.cardContent}>
            <Text style={styles.cardLabel}>selected drink</Text>
            <Text style={styles.cardItemName}>{item.name}</Text>
            <Text style={styles.cardItemMeta}>
              {item.category} / {item.price}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.instructionButton}
            onPress={() => setExpandedNoteId(expandedNoteId === item.id ? null : item.id)}
          >
            <Text style={styles.instructionButtonText}>
              {expandedNoteId === item.id ? '▼ special instructions' : '▶ special instructions'}
            </Text>
          </TouchableOpacity>

          {expandedNoteId === item.id && (
            <View style={styles.expandedSection}>
              <TextInput
                style={styles.cardInput}
                value={notes[item.id] || ''}
                onChangeText={(text) => updateNote(item.id, text)}
                placeholder="e.g. extra sugar, no ice..."
                placeholderTextColor="#bbb"
                multiline
              />
            </View>
          )}

          <View style={styles.cardFooter}>
            <TouchableOpacity
              style={styles.cardButton}
              onPress={() => confirmAllOrders()}
            >
              <Text style={styles.cardButtonText}>confirm order</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeItem(item.id)}
            >
              <Text style={styles.removeButtonText}>remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.addMoreButton} onPress={() => router.push({ pathname: '/(tabs)/menu' })}>
        <Text style={styles.addMoreButtonText}>+ add more drinks</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function OrderSummaryScreen({ route, navigation }: any) {
  const router = useRouter();
  const items = route.params?.items as CartItem[] | undefined;
  const notes = route.params?.notes as { [key: string]: string } | undefined;

  const calculateTotal = () => {
    if (!items || items.length === 0) return 'PHP 0';
    return `${items.length} items`;
  };

  async function startNewOrder() {
    await AsyncStorage.multiRemove(['cartItems', 'cartNotes', 'orderItems', 'orderNotes']);
    router.push({ pathname: '/(tabs)/menu' });
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={true}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.label}>unfnshed</Text>
          <Text style={styles.title}>SUMMARY</Text>
        </View>
      </View>

      <View style={styles.placeholderBox}>
        <Text style={styles.placeholderLabel}>status</Text>
        <Text style={styles.placeholderText}>ready for counter confirmation</Text>
      </View>

      <View style={styles.placeholderBox}>
        <Text style={styles.placeholderLabel}>total items</Text>
        <Text style={styles.itemName}>{calculateTotal()}</Text>
      </View>

      {items && items.map((item, index) => (
        <View key={item.id} style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>drink #{index + 1}</Text>
          <Text style={styles.summaryName}>{item.name}</Text>
          <Text style={styles.summaryMeta}>{item.category} / {item.price}</Text>
          {notes && notes[item.id] && (
            <View style={styles.summaryNoteBox}>
              <Text style={styles.summaryNoteLabel}>special instructions</Text>
              <Text style={styles.summaryNoteText}>{notes[item.id]}</Text>
            </View>
          )}
        </View>
      ))}

      <TouchableOpacity style={styles.button} onPress={startNewOrder}>
        <Text style={styles.buttonText}>new order</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.outlineButton, styles.summaryBack]} onPress={() => navigation.goBack()}>
        <Text style={styles.outlineButtonText}>&lt;- edit order</Text>
      </TouchableOpacity>
    </ScrollView>
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
        <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'CART' }} />
        <Stack.Screen
          name="OrderSummary"
          component={OrderSummaryScreen}
          options={{ title: 'SUMMARY', headerLeft: () => null }}
        />
      </Stack.Navigator>
    </NavigationIndependentTree>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 24,
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
  title: {
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: 4,
    color: '#000',
  },
  section: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 10,
    color: '#999',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  input: {
    minHeight: 88,
    borderWidth: 1,
    borderColor: '#000',
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
    color: '#000',
    backgroundColor: '#fff',
    textAlignVertical: 'top',
  },
  button: {
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#000',
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'lowercase',
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#fff',
    paddingVertical: 12,
    alignItems: 'center',
  },
  outlineButtonText: {
    color: '#000',
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'lowercase',
  },
  summaryBack: {
    marginTop: 12,
  },
  itemBox: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 16,
    marginBottom: 16,
  },
  itemName: {
    color: '#000',
    fontSize: 17,
    fontWeight: '400',
    marginBottom: 6,
  },
  itemMeta: {
    color: '#666',
    fontSize: 13,
  },
  emptyBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    padding: 16,
    marginBottom: 16,
  },
  savedBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    padding: 16,
    marginBottom: 16,
  },
  savedLabel: {
    fontSize: 10,
    color: '#999',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  savedText: {
    fontSize: 15,
    color: '#000',
    marginBottom: 4,
  },
  savedTime: {
    fontSize: 11,
    color: '#666',
  },
  placeholderBox: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 16,
    marginBottom: 12,
  },
  placeholderLabel: {
    fontSize: 10,
    color: '#999',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  placeholderText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  totalText: {
    fontSize: 20,
    color: '#000',
    fontWeight: '300',
  },
  itemCountLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  card: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  cardContent: {
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 10,
    color: '#999',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  cardItemName: {
    fontSize: 18,
    fontWeight: '400',
    color: '#000',
    marginBottom: 6,
  },
  cardItemMeta: {
    fontSize: 13,
    color: '#666',
  },
  instructionButton: {
    borderWidth: 1,
    borderColor: '#000',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  instructionButtonText: {
    fontSize: 12,
    color: '#000',
    letterSpacing: 0.5,
    textTransform: 'lowercase',
  },
  expandedSection: {
    marginBottom: 12,
  },
  cardInput: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#000',
    padding: 12,
    fontSize: 13,
    color: '#000',
    backgroundColor: '#fff',
    textAlignVertical: 'top',
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 10,
  },
  cardButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#000',
    paddingVertical: 12,
    alignItems: 'center',
  },
  cardButtonText: {
    color: '#fff',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'lowercase',
  },
  removeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#fff',
    paddingVertical: 12,
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#000',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'lowercase',
  },
  addMoreButton: {
    borderWidth: 1,
    borderColor: '#000',
    borderStyle: 'dashed',
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  addMoreButtonText: {
    color: '#000',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'lowercase',
  },
  summaryCard: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 14,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  summaryLabel: {
    fontSize: 10,
    color: '#999',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  summaryName: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000',
    marginBottom: 4,
  },
  summaryMeta: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  summaryNoteBox: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 8,
    marginTop: 8,
  },
  summaryNoteLabel: {
    fontSize: 9,
    color: '#999',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  summaryNoteText: {
    fontSize: 12,
    color: '#333',
    lineHeight: 18,
  },
});
