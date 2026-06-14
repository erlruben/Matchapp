import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ───────────────────────────────────────────────────────────────────

type CartItem = {
  id: string;
  category: string;
  name: string;
  price: string;
  desc: string;
};

// ─── Cart Screen ─────────────────────────────────────────────────────────────

export default function CartScreen() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const [notes, setNotes] = useState<{ [key: string]: string }>({});

  const loadCart = useCallback(async () => {
    try {
      const itemsRaw = await AsyncStorage.getItem('cartItems');
      const notesRaw = await AsyncStorage.getItem('cartNotes');
      setCartItems(itemsRaw ? JSON.parse(itemsRaw) : []);
      setNotes(notesRaw ? JSON.parse(notesRaw) : {});
    } catch {
      setCartItems([]);
      setNotes({});
    }
  }, []);

  // useFocusEffect from expo-router fires whenever this tab gains focus in the
  // outer tab navigator — covers first visit and every return from another tab.
  useFocusEffect(
    useCallback(() => {
      loadCart();
      return () => {};
    }, [loadCart])
  );

  async function updateNote(itemId: string, text: string) {
    const updated = { ...notes, [itemId]: text };
    setNotes(updated);
    AsyncStorage.setItem('cartNotes', JSON.stringify(updated)).catch(() => {});
  }

  async function removeItem(itemId: string) {
    const updatedItems = cartItems.filter((item) => item.id !== itemId);
    const updatedNotes = { ...notes };
    delete updatedNotes[itemId];
    setCartItems(updatedItems);
    setNotes(updatedNotes);
    try {
      await AsyncStorage.setItem('cartItems', JSON.stringify(updatedItems));
      await AsyncStorage.setItem('cartNotes', JSON.stringify(updatedNotes));
    } catch {}
  }

  async function confirmOrder() {
    // Re-read from storage to avoid stale state from a concurrent remove.
    try {
      const freshRaw = await AsyncStorage.getItem('cartItems');
      const freshNotesRaw = await AsyncStorage.getItem('cartNotes');
      const freshItems: CartItem[] = freshRaw ? JSON.parse(freshRaw) : cartItems;
      const freshNotes = freshNotesRaw ? JSON.parse(freshNotesRaw) : notes;
      await AsyncStorage.setItem('orderItems', JSON.stringify(freshItems));
      await AsyncStorage.setItem('orderNotes', JSON.stringify(freshNotes));
    } catch {}
    router.push('/order-summary');
  }

  // ─── Empty state ───────────────────────────────────────────────────────────

  if (cartItems.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.headerBlock}>
          <Text style={styles.label}>unfnshed</Text>
          <Text style={styles.title}>CART</Text>
        </View>

        <View style={styles.emptyBox}>
          <Text style={styles.placeholderLabel}>status</Text>
          <Text style={styles.placeholderText}>choose a drink from the menu to start an order</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={() => router.push('/(tabs)/menu')}>
          <Text style={styles.buttonText}>open menu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Cart list ─────────────────────────────────────────────────────────────

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator>
      <View style={styles.headerBlock}>
        <Text style={styles.label}>unfnshed</Text>
        <Text style={styles.title}>CART</Text>
        <Text style={styles.itemCountLabel}>
          {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in cart
        </Text>
      </View>

      {cartItems.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.cardLabel}>selected drink</Text>
          <Text style={styles.cardItemName}>{item.name}</Text>
          <Text style={styles.cardItemMeta}>{item.category} · {item.price}</Text>

          <TouchableOpacity
            style={styles.instructionButton}
            onPress={() => setExpandedNoteId(expandedNoteId === item.id ? null : item.id)}
          >
            <Text style={styles.instructionButtonText}>
              {expandedNoteId === item.id ? '▼ special instructions' : '▶ special instructions'}
            </Text>
          </TouchableOpacity>

          {expandedNoteId === item.id && (
            <TextInput
              style={styles.noteInput}
              value={notes[item.id] || ''}
              onChangeText={(text) => updateNote(item.id, text)}
              placeholder="e.g. extra sugar, no ice..."
              placeholderTextColor="#bbb"
              multiline
            />
          )}

          <TouchableOpacity style={styles.removeButton} onPress={() => removeItem(item.id)}>
            <Text style={styles.removeButtonText}>remove</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity style={styles.addMoreButton} onPress={() => router.push('/(tabs)/menu')}>
        <Text style={styles.addMoreButtonText}>+ add more drinks</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.confirmButton} onPress={confirmOrder}>
        <Text style={styles.confirmButtonText}>
          confirm order ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
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
    marginBottom: 8,
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
  itemCountLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  emptyBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    padding: 16,
    margin: 20,
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
  card: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: '#fff',
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
    marginBottom: 4,
  },
  cardItemMeta: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  instructionButton: {
    borderWidth: 1,
    borderColor: '#000',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  instructionButtonText: {
    fontSize: 12,
    color: '#000',
    letterSpacing: 0.5,
    textTransform: 'lowercase',
  },
  noteInput: {
    minHeight: 72,
    borderWidth: 1,
    borderColor: '#000',
    padding: 12,
    fontSize: 13,
    color: '#000',
    backgroundColor: '#fff',
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  removeButton: {
    borderWidth: 1,
    borderColor: '#000',
    paddingVertical: 10,
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
    marginHorizontal: 20,
    marginBottom: 12,
  },
  addMoreButtonText: {
    color: '#000',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'lowercase',
  },
  confirmButton: {
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#000',
    paddingVertical: 14,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 32,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'lowercase',
  },
  button: {
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#000',
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'lowercase',
  },
});
