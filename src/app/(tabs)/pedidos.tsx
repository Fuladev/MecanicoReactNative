import { router } from 'expo-router';
import { FlatList, Image, View } from 'react-native';
import { Button, Card, EmptyState, ErrorText, Loading, AppText } from '../../components/ui';
import { pedidoTimestamp, stateLabel } from '../../domain/pedido';
import type { PedidoWithId } from '../../domain/schema';
import { getServiceByTipo } from '../../domain/services';
import { useMisPedidos } from '../../hooks';
import { colors, spacing } from '../../theme';

function formatDate(p: PedidoWithId) {
  const t = pedidoTimestamp(p);
  if (!t) return p.date ?? '';
  return new Date(t).toLocaleString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function PedidoCard({ p }: { p: PedidoWithId }) {
  const service = getServiceByTipo(p.Tipo);
  const title = service?.brands ? `${service.historyLabel} ${p.marca ?? ''}` : service?.label ?? p.Tipo ?? 'Servicio';
  const asignado = p.mecanico && !/no se ha asignado/i.test(p.mecanico);
  return (
    <Card style={{ flexDirection: 'row', gap: spacing(3), alignItems: 'center' }}>
      {service ? <Image source={service.icon} style={{ width: 44, height: 44 }} resizeMode="contain" /> : null}
      <View style={{ flex: 1 }}>
        <AppText weight="bold" style={{ color: colors.dark }} numberOfLines={1}>
          {title}
        </AppText>
        {!service?.brands && p.marca ? <AppText numberOfLines={1}>{p.marca}</AppText> : null}
        <AppText style={{ fontSize: 12, color: colors.muted }}>{formatDate(p)}</AppText>
        {asignado ? <AppText style={{ fontSize: 13 }}>Técnico: {p.mecanico}</AppText> : null}
      </View>
      <View style={{ backgroundColor: colors.pink, borderRadius: 12, paddingHorizontal: spacing(2.5), paddingVertical: spacing(1) }}>
        <AppText weight="medium" style={{ fontSize: 12, color: colors.primary }}>
          {stateLabel(p)}
        </AppText>
      </View>
    </Card>
  );
}

export default function Pedidos() {
  const { data, loading, error } = useMisPedidos();
  if (loading) return <Loading />;
  return (
    <FlatList
      data={data}
      keyExtractor={(p) => p.key}
      contentContainerStyle={{ padding: spacing(5), flexGrow: 1 }}
      ListHeaderComponent={<ErrorText>{error}</ErrorText>}
      renderItem={({ item }) => <PedidoCard p={item} />}
      ListEmptyComponent={
        <EmptyState
          title="Aún no tienes pedidos"
          message="Elige un servicio y te asignaremos un técnico."
          action={<Button title="Ver servicios" onPress={() => router.navigate('/')} />}
        />
      }
    />
  );
}
