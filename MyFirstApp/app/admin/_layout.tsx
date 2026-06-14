import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#111' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '400', fontSize: 13, color: '#fff' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'STAFF — MENU ITEMS' }} />
      <Stack.Screen name="edit" options={{ title: 'EDIT ITEM' }} />
    </Stack>
  );
}
