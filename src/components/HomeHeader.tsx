import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useAuth } from '../context/AuthProvider';
import { isActive, stateInfo } from '../domain/pedido';
import { useMisPedidos } from '../hooks';
import { colors, spacing, stateColors } from '../theme';
import { pedidoTitle } from './Pedido';
import { AppText } from './ui';

/** Saludo + acceso al perfil, como la cabecera de Home y Motor en la app iOS. */
export function HomeHeader({ subtitle }: { subtitle?: string }) {
  const { profile } = useAuth();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing(4) }}>
      <View style={{ flex: 1 }}>
        <AppText style={{ fontSize: 13 }}>{subtitle ?? 'Hola,'}</AppText>
        <AppText weight="bold" style={{ fontSize: 20, color: colors.dark }} numberOfLines={1}>
          {[profile?.name, profile?.apel].filter(Boolean).join(' ') || 'Bienvenido'}
        </AppText>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Mi perfil" onPress={() => router.push('/perfil')} hitSlop={8}>
        <Image source={require('../../assets/images/tabs/perfil.png')} style={{ width: 44, height: 44 }} />
      </Pressable>
    </View>
  );
}

/** Botón "Pedido en curso…" de la app iOS: lleva al pedido activo más reciente. */
export function ActivePedidoBanner() {
  const { data } = useMisPedidos();
  const activos = data.filter(isActive);
  const p = activos[0];
  if (!p) return null;
  const info = stateInfo(p);
  const c = stateColors[info.kind];
  const extra = activos.length > 1 ? ` · ${activos.length} activos` : '';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Pedido ${info.label}: ${pedidoTitle(p)}. Ver estado`}
      onPress={() => router.push({ pathname: '/pedido/[id]', params: { id: p.key } })}
      style={({ pressed }) => [styles.banner, { opacity: pressed ? 0.9 : 1 }]}
    >
      <View style={[styles.pulse, { backgroundColor: c.bg }]}>
        <View style={[styles.dot, { backgroundColor: c.dot }]} />
      </View>
      <View style={{ flex: 1 }}>
        <AppText weight="bold" style={{ color: colors.white }}>
          {info.kind === 'en_curso' ? 'Pedido en curso' : 'Pedido enviado'}
          {extra}
        </AppText>
        <AppText style={{ color: colors.white, fontSize: 13, opacity: 0.9 }} numberOfLines={1}>
          {pedidoTitle(p)} · {info.kind === 'en_curso' ? 'un técnico va en camino' : 'buscando técnico'}
        </AppText>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.white} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: spacing(4),
    marginBottom: spacing(5),
  },
  pulse: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 12, height: 12, borderRadius: 6 },
});
