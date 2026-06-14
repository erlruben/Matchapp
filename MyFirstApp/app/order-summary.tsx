import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ───────────────────────────────────────────────────────────────────

type CartItem = {
  id: string;
  category: string;
  name: string;
  price: string;
  desc: string;
};

// ─── Order Summary Screen ────────────────────────────────────────────────────

export default function OrderSummaryScreen() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [notes, setNotes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadOrder();
  }, []);

  async function loadOrder() {
    try {
      const itemsRaw = await AsyncStorage.getItem('orderItems');
      const notesRaw = await AsyncStorage.getItem('orderNotes');
      if (itemsRaw) setItems(JSON.parse(itemsRaw));
      if (notesRaw) setNotes(JSON.parse(notesRaw));
    } catch {}
  }

  function calculateTotal() {
    if (items.length === 0) return 'PHP 0';
    const total = items.reduce((sum, item) => {
      const num = parseFloat(item.price.replace(/[^0-9.]/g, ''));
      return sum + (isNaN(num) ? 0 : num);
    }, 0);
    return `PHP ${total}`;
  }

  async function startNewOrder() {
    await AsyncStorage.multiRemove(['cartItems', 'cartNotes', 'orderItems', 'orderNotes']);
    router.replace('/(tabs)/menu');
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator>
      <View style={styles.headerBlock}>
        <Text style={styles.label}>unfnshed</Text>
        <Text style={styles.title}>SUMMARY</Text>
      </View>

      <View style={styles.statusBox}>
        <Text style={styles.placeholderLabel}>status</Text>
        <Text style={styles.placeholderText}>ready for counter confirmation</Text>
      </View>

      <View style={styles.totalBox}>
        <Text style={styles.placeholderLabel}>total</Text>
        <Text style={styles.totalText}>{calculateTotal()}</Text>
      </View>

      {items.map((item, index) => (
        <View key={item.id} style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>drink #{index + 1}</Text>
          <Text style={styles.summaryName}>{item.name}</Text>
          <Text style={styles.summaryMeta}>{item.category} · {item.price}</Text>
          {notes[item.id] && (
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

      <TouchableOpacity style={styles.outlineButton} onPress={() => router.back()}>
        <Text style={styles.outlineButtonText}>← edit order</Text>
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
  statusBox: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  totalBox: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  totalText: {
    fontSize: 20,
    color: '#000',
    fontWeight: '300',
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
  summaryCard: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 14,
    marginHorizontal: 20,
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
    marginTop: 4,
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
  outlineButton: {
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#fff',
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 32,
  },
  outlineButtonText: {
    color: '#000',
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'lowercase',
  },
});
