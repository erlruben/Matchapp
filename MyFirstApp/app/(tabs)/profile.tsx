import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Profile Screen ───────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const [name, setName] = useState('');
  const [editName, setEditName] = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const stored = await AsyncStorage.getItem('profileName');
    if (stored) setName(stored);
  }

  async function saveName() {
    await AsyncStorage.setItem('profileName', editName);
    setName(editName);
    setEditing(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>[ screen ]</Text>

      <View style={styles.avatarBox}>
        <Text style={styles.avatar}>?</Text>
      </View>

      {editing ? (
        <View style={styles.editBox}>
          <Text style={styles.fieldLabel}>display name</Text>
          <TextInput
            style={styles.input}
            value={editName}
            onChangeText={setEditName}
            placeholder="enter your name"
            placeholderTextColor="#bbb"
          />
          <TouchableOpacity style={styles.saveButton} onPress={saveName}>
            <Text style={styles.saveButtonText}>save</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.nameBlock}>
          <Text style={styles.name}>{name || 'Juan dela Cruz'}</Text>
          <TouchableOpacity onPress={() => { setEditName(name); setEditing(true); }}>
            <Text style={styles.editLink}>edit name</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.email}>juan@coffee.com</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>member since</Text>
        <Text style={styles.cardValue}>January 2024</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>total orders</Text>
        <Text style={styles.cardValue}>12</Text>
      </View>

      <View style={styles.cardDashed}>
        <Text style={styles.cardLabel}>delivery address</Text>
        <Text style={styles.cardPlaceholder}>not set</Text>
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 11,
    color: '#999',
    letterSpacing: 1,
    marginBottom: 24,
    textTransform: 'lowercase',
    alignSelf: 'flex-start',
  },
  avatarBox: {
    width: 80,
    height: 80,
    borderWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    fontSize: 32,
    color: '#ccc',
    fontWeight: '300',
  },
  nameBlock: {
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: '300',
    color: '#000',
    letterSpacing: 1,
  },
  editLink: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    letterSpacing: 0.5,
    textDecorationLine: 'underline',
  },
  editBox: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 10,
    color: '#999',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#000',
    padding: 10,
    fontSize: 14,
    color: '#000',
    marginBottom: 10,
  },
  saveButton: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#000',
    paddingVertical: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'lowercase',
  },
  email: {
    fontSize: 13,
    color: '#999',
    marginBottom: 32,
    marginTop: 8,
    letterSpacing: 0.3,
  },
  card: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#000',
    padding: 16,
    marginBottom: 10,
  },
  cardDashed: {
    width: '100%',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    padding: 16,
    marginBottom: 10,
  },
  cardLabel: {
    fontSize: 10,
    color: '#999',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '300',
    color: '#000',
  },
  cardPlaceholder: {
    fontSize: 14,
    color: '#bbb',
  },
});