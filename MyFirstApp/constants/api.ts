import { Platform } from 'react-native';

// Web + iOS simulator → localhost
// Android emulator → 10.0.2.2 (special alias for host machine)
// Physical phone on Expo Go → replace with your PC's Wi-Fi IP, e.g. 'http://192.168.1.5:3000'
const HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const API_BASE = `http://${HOST}:3000`;