// `firebase/auth` publica tipos web; en React Native Metro resuelve la build RN de @firebase/auth,
// que sí exporta getReactNativePersistence. Esta declaración solo completa los tipos.
import type { Persistence } from 'firebase/auth';

declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: {
    setItem(key: string, value: string): Promise<void>;
    getItem(key: string): Promise<string | null>;
    removeItem(key: string): Promise<void>;
  }): Persistence;
}
