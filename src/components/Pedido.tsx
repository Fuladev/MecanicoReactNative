import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { mecanicoLabel, pedidoAction, pedidoTimestamp, stateInfo, type PedidoAction, type StateInfo } from '../domain/pedido';
import type { Pedido, PedidoWithId } from '../domain/schema';
import { getServiceByTipo } from '../domain/services';
import { colors, spacing, stateColors } from '../theme';
import { AppText } from './ui';

export function pedidoTitle(p: Pick<Pedido, 'Tipo' | 'marca'>) {
  const service = getServiceByTipo(p.Tipo);
  if (service?.brands) return `${service.historyLabel} ${p.marca ?? ''}`.trim();
  return service?.label ?? p.Tipo ?? 'Servicio';
}

export function formatPedidoDate(p: Pick<Pedido, 'createdAt' | 'date'>) {
  const t = pedidoTimestamp(p);
  if (!t) return p.date ?? '';
  return new Date(t).toLocaleString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function StateBadge({ info }: { info: StateInfo }) {
  const c = stateColors[info.kind];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]} accessibilityLabel={`Estado: ${info.label}`}>
      <View style={[styles.dot, { backgroundColor: c.dot }]} />
      <AppText weight="medium" style={{ fontSize: 12, color: c.text }}>
        {info.label}
      </AppText>
    </View>
  );
}

const ACTION_TEXT: Record<PedidoAction, string> = { cancelar: 'Cancelar', eliminar: 'Eliminar' };

export function PedidoCard({ p, onAction }: { p: PedidoWithId; onAction: (p: PedidoWithId, a: PedidoAction) => void }) {
  const service = getServiceByTipo(p.Tipo);
  const info = stateInfo(p);
  const action = pedidoAction(p);
  const mecanico = mecanicoLabel(p);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${pedidoTitle(p)}, ${info.label}. Ver detalle`}
      onPress={() => router.push({ pathname: '/pedido/[id]', params: { id: p.key } })}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
    >
      <View style={{ flexDirection: 'row', gap: spacing(3), alignItems: 'center' }}>
        <View style={styles.iconWrap}>
          {service ? <Image source={service.icon} style={{ width: 36, height: 36 }} resizeMode="contain" /> : <Ionicons name="construct-outline" size={26} color={colors.primary} />}
        </View>
        <View style={{ flex: 1 }}>
          <AppText weight="bold" style={{ color: colors.dark }} numberOfLines={1}>
            {pedidoTitle(p)}
          </AppText>
          {!service?.brands && p.marca ? (
            <AppText numberOfLines={1} style={{ fontSize: 13 }}>
              {p.marca}
            </AppText>
          ) : null}
          <AppText style={{ fontSize: 12, color: colors.muted }}>{formatPedidoDate(p)}</AppText>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.muted} />
      </View>
      <View style={styles.footer}>
        <StateBadge info={info} />
        {mecanico ? (
          <AppText style={{ fontSize: 12, flex: 1 }} numberOfLines={1}>
            {mecanico}
          </AppText>
        ) : (
          <View style={{ flex: 1 }} />
        )}
        {action ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${ACTION_TEXT[action]} pedido`}
            hitSlop={10}
            onPress={() => onAction(p, action)}
            style={styles.action}
          >
            <Ionicons name={action === 'cancelar' ? 'close-circle-outline' : 'trash-outline'} size={16} color={colors.primary} />
            <AppText weight="medium" style={{ fontSize: 13, color: colors.primary }}>
              {ACTION_TEXT[action]}
            </AppText>
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
}

const STEPS = [
  { label: 'Enviado', hint: 'Buscando un técnico' },
  { label: 'En curso', hint: 'Un técnico tomó tu pedido' },
  { label: 'Completado', hint: 'Servicio terminado' },
];

/** Línea de tiempo del pedido: Enviado → En curso → Completado. */
export function StateTimeline({ info }: { info: StateInfo }) {
  if (info.kind === 'cancelado' || info.kind === 'otro') return <StateBadge info={info} />;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
      {STEPS.map((s, i) => {
        const done = i <= info.step;
        const kind = i === 0 ? 'enviado' : i === 1 ? 'en_curso' : 'completado';
        const c = stateColors[kind];
        return (
          <View key={s.label} style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
              <View style={[styles.line, { opacity: i === 0 ? 0 : 1, backgroundColor: done ? c.dot : colors.border }]} />
              <View style={[styles.stepDot, { backgroundColor: done ? c.dot : colors.white, borderColor: done ? c.dot : colors.border }]}>
                {done ? <Ionicons name="checkmark" size={14} color={colors.white} /> : null}
              </View>
              <View
                style={[
                  styles.line,
                  { opacity: i === STEPS.length - 1 ? 0 : 1, backgroundColor: i < info.step ? stateColors[i === 0 ? 'en_curso' : 'completado'].dot : colors.border },
                ]}
              />
            </View>
            <AppText weight={i === info.step ? 'bold' : 'medium'} style={{ fontSize: 12, marginTop: spacing(1.5), color: done ? colors.dark : colors.muted }}>
              {s.label}
            </AppText>
            {i === info.step ? <AppText style={{ fontSize: 11, color: colors.muted, textAlign: 'center' }}>{s.hint}</AppText> : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing(4),
    marginBottom: spacing(3),
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  iconWrap: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
    marginTop: spacing(3),
    paddingTop: spacing(3),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 12, paddingHorizontal: spacing(2.5), paddingVertical: spacing(1) },
  dot: { width: 8, height: 8, borderRadius: 4 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  line: { flex: 1, height: 3, borderRadius: 2 },
  stepDot: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
