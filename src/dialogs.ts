import { Alert, Platform } from 'react-native';

/**
 * `Alert.alert` no hace nada en react-native-web, así que en la vista web usamos los diálogos del navegador.
 */
export function confirmAction(opts: { title: string; message: string; confirmText: string; destructive?: boolean; onConfirm: () => void }) {
  if (Platform.OS === 'web') {
    if (globalThis.confirm?.(`${opts.title}\n\n${opts.message}`)) opts.onConfirm();
    return;
  }
  Alert.alert(opts.title, opts.message, [
    { text: 'Cancelar', style: 'cancel' },
    { text: opts.confirmText, style: opts.destructive ? 'destructive' : 'default', onPress: opts.onConfirm },
  ]);
}

export function notify(title: string, message?: string) {
  if (Platform.OS === 'web') {
    globalThis.alert?.(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
}
