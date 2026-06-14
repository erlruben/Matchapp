import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import matchaData from '../server/data/matcha.json';

// ─── Types ───────────────────────────────────────────────────────────────────

export type MenuItem = {
  id: string;
  category: string;
  name: string;
  price: string;
  desc: string;
  available: boolean;
  featured: boolean;
};

type MenuContextType = {
  items: MenuItem[];
  isLoaded: boolean;
  addItem: (item: Omit<MenuItem, 'id' | 'available' | 'featured'>) => Promise<void>;
  updateItem: (id: string, changes: Partial<Omit<MenuItem, 'id'>>) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  toggleAvailable: (id: string) => Promise<void>;
  toggleFeatured: (id: string) => Promise<void>;
};

// ─── Seed data (first launch) ─────────────────────────────────────────────────

const SEED_ITEMS: MenuItem[] = matchaData.drinks.map((d) => ({
  id: String(d.id),
  category: d.category,
  name: d.name,
  price: `PHP ${d.price}`,
  desc: d.description,
  available: true,
  featured: false,
}));

// ─── Context ─────────────────────────────────────────────────────────────────

const MenuContext = createContext<MenuContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('menuItems');
        if (raw) {
          // Backfill `featured` for items saved before this field existed
          const parsed: MenuItem[] = JSON.parse(raw);
          const migrated = parsed.map((i) => ({ ...i, featured: i.featured ?? false }));
          setItems(migrated);
        } else {
          setItems(SEED_ITEMS);
          await AsyncStorage.setItem('menuItems', JSON.stringify(SEED_ITEMS));
        }
      } catch {
        setItems(SEED_ITEMS);
      }
      setIsLoaded(true);
    })();
  }, []);

  async function persist(updated: MenuItem[]) {
    setItems(updated);
    await AsyncStorage.setItem('menuItems', JSON.stringify(updated)).catch(() => {});
  }

  async function addItem(item: Omit<MenuItem, 'id' | 'available' | 'featured'>) {
    await persist([...items, { ...item, id: `custom-${Date.now()}`, available: true, featured: false }]);
  }

  async function updateItem(id: string, changes: Partial<Omit<MenuItem, 'id'>>) {
    await persist(items.map((i) => (i.id === id ? { ...i, ...changes } : i)));
  }

  async function removeItem(id: string) {
    await persist(items.filter((i) => i.id !== id));
  }

  async function toggleAvailable(id: string) {
    await persist(items.map((i) => (i.id === id ? { ...i, available: !i.available } : i)));
  }

  async function toggleFeatured(id: string) {
    await persist(items.map((i) => (i.id === id ? { ...i, featured: !i.featured } : i)));
  }

  return (
    <MenuContext.Provider value={{ items, isLoaded, addItem, updateItem, removeItem, toggleAvailable, toggleFeatured }}>
      {children}
    </MenuContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error('useMenu must be used within MenuProvider');
  return ctx;
}
