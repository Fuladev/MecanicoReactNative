import * as Network from 'expo-network';

/** Reemplaza las comprobaciones de ConnectivityManager repetidas en cada botón de la app Java. */
export async function isOnline(): Promise<boolean> {
  try {
    const s = await Network.getNetworkStateAsync();
    return !!s.isConnected && s.isInternetReachable !== false;
  } catch {
    return true;
  }
}

export const OFFLINE_MESSAGE = 'No hay conexión a internet. Revisa tu conexión e intenta de nuevo.';
