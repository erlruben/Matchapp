import Constants from 'expo-constants';
import { Platform } from 'react-native';

const expoHost = Constants.expoConfig?.hostUri?.split(':')[0];

// Android emulator uses this alias for the host machine. Expo Go can usually
// infer the dev server's LAN host from the manifest.
const HOST = Platform.OS === 'android' && !expoHost ? '10.0.2.2' : expoHost ?? 'localhost';

export const API_BASE = `http://${HOST}:3000`;
