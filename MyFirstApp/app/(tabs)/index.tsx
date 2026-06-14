import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useCart } from '../../context/CartContext';
import { useTabletLayout } from '../../constants/layout';

// ─── Welcome / Kiosk Home Screen ─────────────────────────────────────────────

export default function WelcomeScreen() {
  const router = useRouter();
  const { cartItems } = useCart();
  const { isTablet } = useTabletLayout();

  return (
    <View style={styles.container}>
      <View style={[styles.inner, isTablet && styles.innerTablet]}>

        {/* Brand */}
        <View style={styles.brandBlock}>
          <Text style={[styles.brandName, isTablet && styles.brandNameTablet]}>fnshedrink</Text>
          <Text style={[styles.tagline, isTablet && styles.taglineTablet]}>MATCHA BAR</Text>
        </View>

        {/* Prompt */}
        <Text style={[styles.prompt, isTablet && styles.promptTablet]}>
          what would you like today?
        </Text>

        {/* Featured drinks hint */}
        <View style={styles.hintBox}>
          <Text style={styles.hintLabel}>{"today's selection"}</Text>
          <Text style={styles.hintText}>ceremonial lattes · pure matcha · frappes · specials</Text>
        </View>

        {/* Primary CTA */}
        <TouchableOpacity
          style={[styles.startButton, isTablet && styles.startButtonTablet]}
          onPress={() => router.push('/(tabs)/menu')}
        >
          <Text style={[styles.startButtonText, isTablet && styles.startButtonTextTablet]}>
            start ordering
          </Text>
        </TouchableOpacity>

        {/* Resume in-progress cart if one exists */}
        {cartItems.length > 0 && (
          <TouchableOpacity
            style={[styles.resumeButton, isTablet && styles.resumeButtonTablet]}
            onPress={() => router.push(isTablet ? '/(tabs)/menu' : '/(tabs)/cart')}
          >
            <Text style={[styles.resumeButtonText, isTablet && styles.resumeButtonTextTablet]}>
              resume order — {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in cart
            </Text>
          </TouchableOpacity>
        )}

      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: 480,
    paddingHorizontal: 32,
  },
  innerTablet: {
    maxWidth: 640,
    paddingHorizontal: 64,
  },
  brandBlock: {
    marginBottom: 40,
  },
  brandName: {
    fontSize: 42,
    fontWeight: '200',
    color: '#000',
    letterSpacing: 6,
    textTransform: 'lowercase',
  },
  brandNameTablet: {
    fontSize: 64,
    letterSpacing: 8,
  },
  tagline: {
    fontSize: 13,
    color: '#999',
    letterSpacing: 6,
    marginTop: 4,
  },
  taglineTablet: {
    fontSize: 16,
    letterSpacing: 8,
    marginTop: 8,
  },
  prompt: {
    fontSize: 18,
    color: '#333',
    fontWeight: '300',
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  promptTablet: {
    fontSize: 24,
    marginBottom: 32,
  },
  hintBox: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    padding: 16,
    marginBottom: 32,
  },
  hintLabel: {
    fontSize: 9,
    color: '#999',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  hintText: {
    fontSize: 13,
    color: '#444',
    lineHeight: 20,
    textTransform: 'lowercase',
  },
  startButton: {
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#000',
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    minHeight: 52,
    justifyContent: 'center',
  },
  startButtonTablet: {
    paddingVertical: 22,
    minHeight: 68,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 14,
    letterSpacing: 2,
    textTransform: 'lowercase',
  },
  startButtonTextTablet: {
    fontSize: 18,
    letterSpacing: 3,
  },
  resumeButton: {
    borderWidth: 1,
    borderColor: '#000',
    paddingVertical: 14,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  resumeButtonTablet: {
    paddingVertical: 18,
    minHeight: 60,
  },
  resumeButtonText: {
    color: '#000',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'lowercase',
  },
  resumeButtonTextTablet: {
    fontSize: 15,
    letterSpacing: 1.5,
  },
});
