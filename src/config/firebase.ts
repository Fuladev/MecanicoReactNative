import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth, type Auth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

/**
 * Mismo proyecto Firebase que la app Java (mecanico-2d3de), así los usuarios y su historial siguen ahí.
 * Estos valores son identificadores públicos del proyecto (no son secretos). Se pueden sobreescribir con
 * variables EXPO_PUBLIC_FIREBASE_* (ver .env.example), por ejemplo para usar la config de una app "Web"
 * registrada en la consola de Firebase.
 */
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? 'AIzaSyCsUCondZ_rqKAio-504yJ718XmysHZnGM',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'mecanico-2d3de.firebaseapp.com',
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL ?? 'https://mecanico-2d3de.firebaseio.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? 'mecanico-2d3de',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'mecanico-2d3de.appspot.com',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_SENDER_ID ?? '347851123568',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '1:347851123568:android:d3aea73b3d9ac393a03db5',
};

/** Client IDs OAuth de Google ya registrados en el proyecto (google-services.json). */
export const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '347851123568-aorunkcv8a0e21pmtl593sua5re6g273.apps.googleusercontent.com';
export const GOOGLE_IOS_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '347851123568-207hu6aocod167agsvudc4nfr0av7gca.apps.googleusercontent.com';

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

function createAuth(): Auth {
  try {
    return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch {
    // Fast refresh: auth ya inicializado.
    return getAuth(app);
  }
}

export const auth = createAuth();
export const db = getDatabase(app);
