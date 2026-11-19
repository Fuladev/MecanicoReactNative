import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import type { ComponentProps } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { formatPedidoDate, pedidoTitle, StateBadge, StateTimeline } from '../../../components/Pedido';
import { AppText, Button, Card, EmptyState, ErrorText, Loading, Screen } from '../../../components/ui';
import { useAuth } from '../../../context/AuthProvider';
import { confirmAction, notify } from '../../../dialogs';
import { formatMoney, mecanicoLabel, pedidoAction, stateInfo } from '../../../domain/pedido';
import { getServiceByTipo } from '../../../domain/services';
import { usePedido } from '../../../hooks';
import { borrarPedido } from '../../../services/pedidos';
import { colors, spacing } from '../../../theme';

function InfoRow({ icon, label, value }: { icon: ComponentProps<typeof Ionicons>['name']; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={18} color={colors.muted} style={{ marginTop: 2 }} />
      <View style={{ flex: 1 }}>
        <AppText style={{ fontSize: 12, color: colors.muted }}>{label}</AppText>
        <AppText style={{ color: colors.dark }}>{value}</AppText>
      </View>
    </View>
  );
}

/** Detalle del pedido (StateViewController en iOS): estado en vivo, datos, técnico y acceso a la factura. */
export default function DetallePedido() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { data: p, loading, error } = usePedido(id);

  if (loading) return <Loading />;
  if (!p) {
    return (
      <Screen>
        <ErrorText>{error}</ErrorText>
        <EmptyState
          title="Pedido no encontrado"
          message="Puede que lo hayas cancelado o eliminado."
          action={<Button title="Volver" onPress={() => router.back()} />}
        />
      </Screen>
    );
  }

  const service = getServiceByTipo(p.Tipo);
  const info = stateInfo(p);
  const action = pedidoAction(p);
  const completo = info.kind === 'completado';

  const borrar = () => {
    if (!user || !action) return;
    confirmAction({
      title: action === 'cancelar' ? 'Cancelar pedido' : 'Eliminar del historial',
      message: action === 'cancelar' ? 'Aún no lo ha tomado ningún técnico. ¿Quieres cancelarlo?' : 'Solo se quitará de tu lista.',
      confirmText: action === 'cancelar' ? 'Cancelar pedido' : 'Eliminar',
      destructive: true,
      onConfirm: async () => {
        try {
          await borrarPedido(user.uid, p.key, action);
          router.back();
        } catch {
          notify('Error', 'No se pudo completar la acción. Intenta de nuevo.');
        }
      },
    });
  };

  return (
    <Screen>
      <Card style={{ alignItems: 'center', paddingVertical: spacing(5) }}>
        <View style={styles.iconWrap}>
          {service ? (
            <Image source={service.icon} style={{ width: 48, height: 48 }} resizeMode="contain" />
          ) : (
            <Ionicons name="construct-outline" size={32} color={colors.primary} />
          )}
        </View>
        <AppText weight="bold" style={{ fontSize: 18, color: colors.dark, marginTop: spacing(3), textAlign: 'center' }}>
          {pedidoTitle(p)}
        </AppText>
        <AppText style={{ fontSize: 13, color: colors.muted, marginBottom: spacing(4) }}>{formatPedidoDate(p)}</AppText>
        <View style={{ alignSelf: 'stretch' }}>
          <StateTimeline info={info} />
        </View>
      </Card>

      <Card>
        <AppText weight="bold" style={styles.section}>
          Datos del pedido
        </AppText>
        {!service?.brands ? <InfoRow icon="pricetag-outline" label={service?.detailLabel ?? 'Detalle'} value={p.marca} /> : null}
        <InfoRow icon="person-outline" label="Técnico" value={mecanicoLabel(p) ?? 'Aún sin asignar'} />
        <InfoRow icon="location-outline" label="Dirección" value={[p.dir, p.ciu].filter(Boolean).join(' · ')} />
        <InfoRow icon="call-outline" label="Teléfono de contacto" value={p.cel} />
      </Card>

      <Card>
        <AppText weight="bold" style={styles.section}>
          Descripción del servicio
        </AppText>
        <AppText style={{ color: colors.dark }}>{p.des || 'Sin descripción.'}</AppText>
      </Card>

      {completo ? (
        <Card style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <AppText style={{ fontSize: 12, color: colors.muted }}>Total del servicio</AppText>
            <AppText weight="bold" style={{ fontSize: 20, color: colors.dark }}>
              {p.Factura ? formatMoney(p.Factura.total) : 'Pendiente'}
            </AppText>
          </View>
          <StateBadge info={info} />
        </Card>
      ) : null}

      <Button
        title={completo ? 'Ver factura' : 'La factura estará lista al terminar'}
        icon={<Ionicons name="receipt-outline" size={18} color={completo ? colors.white : colors.muted} />}
        disabled={!completo}
        variant={completo ? 'primary' : 'secondary'}
        onPress={() => router.push({ pathname: '/pedido/[id]/factura', params: { id: p.key } })}
      />
      {action ? <Button title={action === 'cancelar' ? 'Cancelar pedido' : 'Eliminar del historial'} variant="ghost" onPress={borrar} /> : null}
      {info.kind === 'en_curso' ? (
        <AppText style={{ textAlign: 'center', fontSize: 13, color: colors.muted }}>
          Un técnico ya tomó tu pedido, por eso no se puede cancelar desde la app.
        </AppText>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  iconWrap: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  section: { color: colors.dark, fontSize: 16, marginBottom: spacing(2) },
  row: { flexDirection: 'row', gap: spacing(3), paddingVertical: spacing(2) },
});
