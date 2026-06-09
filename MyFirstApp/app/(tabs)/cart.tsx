import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationIndependentTree } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

// ─── Cart Screen ─────────────────────────────────────────────────────────────
function CartScreen({ navigation }: any) {
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState<{ note: string; time: string } | null>(null);

  useEffect(() => {
    loadNote();
  }, []);

  async function loadNote() {
    const raw = await AsyncStorage.getItem('orderNote');
    if (raw) {
      const parsed = JSON.parse(raw);
      setSaved(parsed);
    }
  }

  async function saveNote() {
    const order = { note: note, time: new Date().toLocaleTimeString() };
    await AsyncStorage.setItem('orderNote', JSON.stringify(order));
    setSaved(order);
    setNote('');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>[ screen ]</Text>
      <Text style={styles.title}>CART</Text>
      <Text style={styles.subtitle}>order notes only — items not wired yet</Text>

      <View style={styles.section}>
        <Text style={styles.fieldLabel}>special instructions</Text>
        <TextInput
          style={styles.input}
          value={note}
          onChangeText={setNote}
          placeholder="e.g. extra sugar, no ice..."
          placeholderTextColor="#bbb"
        />
        <TouchableOpacity style={styles.button} onPress={saveNote}>
          <Text style={styles.buttonText}>save note</Text>
        </TouchableOpacity>
      </View>

      {saved && (
        <View style={styles.savedBox}>
          <Text style={styles.savedLabel}>last saved</Text>
          <Text style={styles.savedText}>{saved.note}</Text>
          <Text style={styles.savedTime}>at {saved.time}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, styles.outlineButton]}
        onPress={() => navigation.navigate('OrderSummary')}
      >
        <Text style={styles.outlineButtonText}>view order summary →</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Order Summary Screen ────────────────────────────────────────────────────
function OrderSummaryScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>[ screen ]</Text>
      <Text style={styles.title}>ORDER SUMMARY</Text>

      <View style={styles.placeholderBox}>
        <Text style={styles.placeholderLabel}>status</Text>
        <Text style={styles.placeholderText}>empty — no items in cart</Text>
      </View>

      <View style={styles.placeholderBox}>
        <Text style={styles.placeholderLabel}>total</Text>
        <Text style={styles.placeholderText}>₱ ---</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>← back to cart</Text>
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

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 28,
    letterSpacing: 0.3,
  },
  section: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 10,
    color: '#999',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
    color: '#000',
    backgroundColor: '#fff',
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
    backgroundColor: '#fff',
    marginTop: 24,
  },
  outlineButtonText: {
    color: '#000',
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'lowercase',
  },
  savedBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    padding: 16,
    marginBottom: 8,
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
  },
});