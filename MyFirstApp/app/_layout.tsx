import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// ─── Root Layout ─────────────────────────────────────────────────────────────
export default function RootLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>

      <StatusBar style="dark" />
    </>
  );
}