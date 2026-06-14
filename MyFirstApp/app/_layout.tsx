import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#fff' },
          headerTintColor: '#000',
          headerTitleStyle: { fontWeight: '400', fontSize: 13 },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="order-summary" options={{ title: 'ORDER SUMMARY' }} />
      </Stack>

      <StatusBar style="dark" />
    </>
  );
}
