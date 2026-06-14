import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// ─── Types ───────────────────────────────────────────────────────────────────

type StoreUpdate = {
  id: number;
  title: string;
  body: string;
};

// ─── What's New Screen ───────────────────────────────────────────────────────

export default function WhatsNewScreen() {
  const router = useRouter();
  const [updates, setUpdates] = useState<StoreUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUpdates();
  }, []);

  async function fetchUpdates() {
    try {
      setLoading(true);
      const response = await fetch('https://jsonplaceholder.typicode.com/posts');
      if (!response.ok) throw new Error('Request failed');
      const data = await response.json();
      setUpdates(data.slice(0, 8));
      setError('');
    } catch {
      setError("Can't load updates right now. Check your internet connection.");
    } finally {
      setLoading(false);
    }
  }

  // ─── Loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.metaText}>loading updates...</Text>
      </View>
    );
  }

  // ─── Error ─────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <View style={styles.centered}>
        <View style={styles.errorBox}>
          <Text style={styles.errorLabel}>[ offline ]</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
        <TouchableOpacity style={styles.retryButton} onPress={fetchUpdates}>
          <Text style={styles.retryButtonText}>retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Feed ──────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <View style={styles.headerBlock}>
        <Text style={styles.label}>unfnshed</Text>
        <Text style={styles.heading}>NEW TODAY</Text>
        <Text style={styles.subheading}>{updates.length} store updates</Text>
      </View>

      <FlatList
        data={updates}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <TouchableOpacity
            style={styles.orderShortcut}
            onPress={() => router.push('/(tabs)/menu')}
          >
            <Text style={styles.shortcutLabel}>ready to order?</Text>
            <Text style={styles.shortcutText}>open the unfnshed menu</Text>
          </TouchableOpacity>
        }
        renderItem={({ item }) => (
          <View style={styles.feedCard}>
            <Text style={styles.cardLabel}>store update #{item.id}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        )}
      />
    </View>
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
    marginBottom: 16,
  },
  errorLabel: {
    fontSize: 11,
    color: '#666',
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: 'lowercase',
  },
  errorText: {
    color: '#000',
    fontSize: 14,
    lineHeight: 20,
  },
  retryButton: {
    borderWidth: 1,
    borderColor: '#000',
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryButtonText: {
    color: '#000',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'lowercase',
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
    color: '#000',
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: 4,
  },
  subheading: {
    color: '#666',
    fontSize: 12,
    letterSpacing: 0.5,
    marginTop: 4,
  },
  list: {
    padding: 20,
    gap: 12,
  },
  orderShortcut: {
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#000',
    padding: 16,
  },
  shortcutLabel: {
    color: '#999',
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  shortcutText: {
    color: '#fff',
    fontSize: 16,
    letterSpacing: 0.5,
    textTransform: 'lowercase',
  },
  feedCard: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 16,
    backgroundColor: '#fff',
  },
  cardLabel: {
    color: '#999',
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  title: {
    color: '#000',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
    marginBottom: 10,
    textTransform: 'capitalize',
  },
  body: {
    color: '#333',
    fontSize: 14,
    lineHeight: 22,
  },
});
