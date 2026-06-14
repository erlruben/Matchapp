import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CartItem } from './CartContext';

// ─── Types ───────────────────────────────────────────────────────────────────

export type Order = {
  id: string;
  timestamp: number;
  items: CartItem[];
  notes: { [key: string]: string };
  status: 'pending' | 'done';
};

type OrderContextType = {
  orders: Order[];
  pendingCount: number;
  isLoaded: boolean;
  placeOrder: (items: CartItem[], notes: { [key: string]: string }) => Promise<void>;
  markDone: (orderId: string) => Promise<void>;
  clearDone: () => Promise<void>;
};

// ─── Context ─────────────────────────────────────────────────────────────────

const OrderContext = createContext<OrderContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('orderQueue');
        if (raw) setOrders(JSON.parse(raw));
      } catch {}
      setIsLoaded(true);
    })();
  }, []);

  async function persist(updated: Order[]) {
    setOrders(updated);
    await AsyncStorage.setItem('orderQueue', JSON.stringify(updated)).catch(() => {});
  }

  async function placeOrder(items: CartItem[], notes: { [key: string]: string }) {
    const order: Order = {
      id: `order-${Date.now()}`,
      timestamp: Date.now(),
      items,
      notes,
      status: 'pending',
    };
    await persist([order, ...orders]);
  }

  async function markDone(orderId: string) {
    await persist(orders.map((o) => (o.id === orderId ? { ...o, status: 'done' } : o)));
  }

  async function clearDone() {
    await persist(orders.filter((o) => o.status !== 'done'));
  }

  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  return (
    <OrderContext.Provider value={{ orders, pendingCount, isLoaded, placeOrder, markDone, clearDone }}>
      {children}
    </OrderContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useOrders() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrders must be used within OrderProvider');
  return ctx;
}
