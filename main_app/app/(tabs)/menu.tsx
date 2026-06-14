import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useRef } from 'react';
import { useCart } from '../../context/CartContext';
import { useMenu, type MenuItem } from '../../context/MenuContext';
import { useTabletLayout } from '../../constants/layout';
import CartPanel from '../../components/CartPanel';

// ─── Menu Screen ─────────────────────────────────────────────────────────────

export default function MenuScreen() {
  const router = useRouter();
  const { addToCart } = useCart();
  const { items: allItems, isLoaded: menuLoaded } = useMenu();
  const { isTablet } = useTabletLayout();

  const [toastVisible, setToastVisible] = useState(false);
  const [toastItem, setToastItem] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function handleAddToCart(item: MenuItem) {
    try {
      await addToCart(item);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      setToastItem(item.name);
      setToastVisible(true);
      toastTimer.current = setTimeout(() => setToastVisible(false), 2000);
    } catch {}
  }

  // ─── Loading ───────────────────────────────────────────────────────────────

  if (!menuLoaded) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.metaText}>loading fnshedrink menu...</Text>
      </View>
    );
  }

  // Featured items float to top; unavailable items hidden from customers.
  const availableItems = allItems.filter((i) => i.available);
  const listData = [
    ...availableItems.filter((i) => i.featured),
    ...availableItems.filter((i) => !i.featured),
  ];

  const numColumns = isTablet ? 2 : 1;

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={styles.splitContainer}>

      {/* Menu column */}
      <View style={styles.menuColumn}>
        <View style={styles.headerBlock}>
          <Text style={styles.label}>fnshedrink</Text>
          <Text style={[styles.heading, isTablet && styles.headingTablet]}>MENU</Text>
          <Text style={styles.subheading}>
            {availableItems.length} drinks available
          </Text>
        </View>

        {listData.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.metaText}>no drinks available right now</Text>
          </View>
        ) : (
          <FlatList
            data={listData}
            key={numColumns}
            keyExtractor={(item) => item.id}
            numColumns={numColumns}
            contentContainerStyle={styles.list}
            columnWrapperStyle={isTablet ? styles.columnWrapper : undefined}
            renderItem={({ item }) => (
              <View style={[styles.item, isTablet && styles.itemTablet, item.featured && styles.itemFeatured]}>
                <TouchableOpacity
                  style={{ flex: 1 }}
                  activeOpacity={0.6}
                  onPress={() =>
                    router.push({ pathname: '/menu-detail', params: { itemId: item.id } })
                  }
                >
                  <View style={styles.itemTopRow}>
                    <Text style={styles.itemLabel}>{item.category}</Text>
                    {item.featured && (
                      <View style={styles.featuredBadge}>
                        <Text style={styles.featuredBadgeText}>popular</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.itemName, isTablet && styles.itemNameTablet]}>
                    {item.name}
                  </Text>
                  <Text style={styles.itemDesc}>{item.desc}</Text>
                </TouchableOpacity>

                <View style={styles.itemFooter}>
                  <Text style={[styles.itemPrice, isTablet && styles.itemPriceTablet]}>
                    {item.price}
                  </Text>
                  <TouchableOpacity
                    style={[styles.cartButton, isTablet && styles.cartButtonTablet]}
                    onPress={() => handleAddToCart(item)}
                  >
                    <Text style={[styles.cartButtonText, isTablet && styles.cartButtonTextTablet]}>
                      add to cart
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}

        {toastVisible && (
          <View style={styles.toast}>
            <Text style={styles.toastText}>{toastItem} added to cart</Text>
          </View>
        )}
      </View>

      {/* Cart panel — tablet only */}
      {isTablet && <CartPanel />}

    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  splitContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
  },
  menuColumn: {
    flex: 1,
    backgroundColor: '#fff',
  },
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
    color: '#999',
    letterSpacing: 1,
    textTransform: 'lowercase',
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
  headingTablet: {
    fontSize: 36,
  },
  subheading: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  columnWrapper: {
    gap: 12,
  },
  item: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#000',
    padding: 16,
    backgroundColor: '#fff',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  itemTablet: {
    padding: 20,
  },
  itemFeatured: {
    borderColor: '#000',
    backgroundColor: '#fafaf8',
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemLabel: {
    fontSize: 10,
    color: '#999',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  featuredBadge: {
    backgroundColor: '#000',
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  featuredBadgeText: {
    color: '#fff',
    fontSize: 9,
    letterSpacing: 1,
    textTransform: 'lowercase',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000',
    marginBottom: 8,
  },
  itemNameTablet: {
    fontSize: 19,
    marginBottom: 10,
  },
  itemDesc: {
    color: '#444',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 10,
    gap: 8,
  },
  itemPrice: {
    fontSize: 14,
    color: '#000',
    alignSelf: 'center',
  },
  itemPriceTablet: {
    fontSize: 16,
  },
  cartButton: {
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartButtonTablet: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 48,
  },
  cartButtonText: {
    color: '#fff',
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'lowercase',
  },
  cartButtonTextTablet: {
    fontSize: 13,
  },
  toast: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  toastText: {
    color: '#fff',
    fontSize: 12,
    letterSpacing: 0.5,
    textAlign: 'center',
    textTransform: 'lowercase',
  },
});
