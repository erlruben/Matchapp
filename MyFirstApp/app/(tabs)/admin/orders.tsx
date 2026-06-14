import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useOrders } from '../../../context/OrderContext';
import type { Order } from '../../../context/OrderContext';

// ─── Staff — Orders View ──────────────────────────────────────────────────────

export default function OrdersScreen() {
  const { orders, isLoaded, markDone, clearDone } = useOrders();

  if (!isLoaded) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  const pending = orders.filter((o) => o.status === 'pending');
  const done = orders.filter((o) => o.status === 'done');

  function formatTime(ts: number) {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function getTotal(order: Order) {
    return order.items.reduce((sum, item) => {
      const n = parseFloat(item.price.replace(/[^0-9.]/g, ''));
      return sum + (isNaN(n) ? 0 : n);
    }, 0);
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

      {/* ── Pending ── */}
      <Text style={styles.sectionLabel}>
        pending {pending.length > 0 ? `— ${pending.length}` : ''}
      </Text>

      {pending.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>no pending orders</Text>
          <Text style={styles.emptyText}>confirmed orders from customers will appear here</Text>
        </View>
      ) : (
        pending.map((order) => (
          <View key={order.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.orderTime}>{formatTime(order.timestamp)}</Text>
                <Text style={styles.orderCount}>
                  {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                </Text>
              </View>
              <Text style={styles.orderTotal}>PHP {getTotal(order)}</Text>
            </View>

            <View style={styles.divider} />

            {order.items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>{item.price}</Text>
                {order.notes[item.id] ? (
                  <Text style={styles.itemNote}>note: {order.notes[item.id]}</Text>
                ) : null}
              </View>
            ))}

            <TouchableOpacity style={styles.doneButton} onPress={() => markDone(order.id)}>
              <Text style={styles.doneButtonText}>mark as done</Text>
            </TouchableOpacity>
          </View>
        ))
      )}

      {/* ── Completed ── */}
      {done.length > 0 && (
        <>
          <View style={styles.doneSeparator}>
            <Text style={styles.sectionLabel}>completed — {done.length}</Text>
            <TouchableOpacity onPress={clearDone}>
              <Text style={styles.clearText}>clear all</Text>
            </TouchableOpacity>
          </View>

          {done.map((order) => (
            <View key={order.id} style={styles.cardDone}>
              <View style={styles.cardHeader}>
                <Text style={styles.orderTimeDone}>{formatTime(order.timestamp)}</Text>
                <Text style={styles.orderTotalDone}>PHP {getTotal(order)}</Text>
              </View>
              {order.items.map((item) => (
                <Text key={item.id} style={styles.itemNameDone}>{item.name}</Text>
              ))}
            </View>
          ))}
        </>
      )}

      <View style={{ height: 48 }} />
    </ScrollView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
  },
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  content: {
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
    padding: 16,
  },
  sectionLabel: {
    fontSize: 10,
    color: '#555',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 8,
  },
  emptyBox: {
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderStyle: 'dashed',
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#555',
    fontSize: 14,
    marginBottom: 6,
    textTransform: 'lowercase',
    letterSpacing: 0.5,
  },
  emptyText: {
    color: '#444',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderTime: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '300',
    letterSpacing: 1,
  },
  orderCount: {
    fontSize: 11,
    color: '#555',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  orderTotal: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '300',
  },
  divider: {
    height: 1,
    backgroundColor: '#2a2a2a',
    marginBottom: 12,
  },
  itemRow: {
    marginBottom: 10,
  },
  itemName: {
    fontSize: 14,
    color: '#ddd',
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 11,
    color: '#555',
    marginBottom: 2,
  },
  itemNote: {
    fontSize: 11,
    color: '#888',
    fontStyle: 'italic',
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#333',
    marginTop: 2,
  },
  doneButton: {
    borderWidth: 1,
    borderColor: '#2d6a2d',
    backgroundColor: '#1a3a1a',
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
    minHeight: 48,
    justifyContent: 'center',
  },
  doneButtonText: {
    color: '#6aaa6a',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'lowercase',
  },
  doneSeparator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 10,
  },
  clearText: {
    fontSize: 11,
    color: '#555',
    letterSpacing: 0.5,
    textTransform: 'lowercase',
    textDecorationLine: 'underline',
  },
  cardDone: {
    backgroundColor: '#161616',
    borderWidth: 1,
    borderColor: '#222',
    padding: 14,
    marginBottom: 8,
  },
  orderTimeDone: {
    fontSize: 13,
    color: '#444',
  },
  orderTotalDone: {
    fontSize: 13,
    color: '#444',
  },
  itemNameDone: {
    fontSize: 12,
    color: '#3a3a3a',
    marginTop: 4,
  },
});
