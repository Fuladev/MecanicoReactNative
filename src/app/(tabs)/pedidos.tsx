import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DireccionesList } from '../../components/DireccionesList';
import { PedidoCard } from '../../components/Pedido';
import { AppText, Button, EmptyState, ErrorText, Loading } from '../../components/ui';
import { useAuth } from '../../context/AuthProvider';
import { confirmAction, notify } from '../../dialogs';
import type { PedidoAction } from '../../domain/pedido';
import type { PedidoWithId } from '../../domain/schema';
import { useMisPedidos } from '../../hooks';
import { borrarPedido } from '../../services/pedidos';
import { colors, spacing } from '../../theme';

type Segment = 'pedidos' | 'direcciones';

/** Pantalla "Pedidos" de la app iOS, con el selector Pedidos / Direcciones arriba. */
export default function Pedidos() {
  const [segment, setSegment] = useState<Segment>('pedidos');
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={{ paddingHorizontal: spacing(5), paddingTop: spacing(4) }}>
        <AppText weight="bold" style={{ fontSize: 22, color: colors.dark, marginBottom: spacing(3) }}>
          {segment === 'pedidos' ? 'Mis pedidos' : 'Mis direcciones'}
        </AppText>
        <View style={styles.segmented} accessibilityRole="tablist">
          {(['pedidos', 'direcciones'] as const).map((s) => (
            <Pressable
              key={s}
              accessibilityRole="tab"
              accessibilityState={{ selected: segment === s }}
              onPress={() => setSegment(s)}
              style={[styles.segment, segment === s && styles.segmentOn]}
            >
              <AppText weight="bold" style={{ fontSize: 14, color: segment === s ? colors.white : colors.dark }}>
                {s === 'pedidos' ? 'Pedidos' : 'Direcciones'}
              </AppText>
            </Pressable>
          ))}
        </View>
      </View>
      {segment === 'pedidos' ? <ListaPedidos /> : <DireccionesList />}
    </SafeAreaView>
  );
}

function ListaPedidos() {
  const { user } = useAuth();
  const { data, loading, error } = useMisPedidos();
  if (loading) return <Loading />;

  const onAction = (p: PedidoWithId, action: PedidoAction) =>
    confirmAction(
      action === 'cancelar'
        ? {
            title: 'Cancelar pedido',
            message: 'Aún no lo ha tomado ningún técnico. Si lo cancelas, desaparece de la lista de técnicos.',
            confirmText: 'Cancelar pedido',
            destructive: true,
            onConfirm: () => user && borrarPedido(user.uid, p.key, action).catch(() => notify('Error', 'No se pudo cancelar el pedido.')),
          }
        : {
            title: 'Eliminar del historial',
            message: 'El pedido ya terminó. Solo se quitará de tu lista.',
            confirmText: 'Eliminar',
            destructive: true,
            onConfirm: () => user && borrarPedido(user.uid, p.key, action).catch(() => notify('Error', 'No se pudo eliminar el pedido.')),
          },
    );

  return (
    <FlatList
      data={data}
      keyExtractor={(p) => p.key}
      contentContainerStyle={{ padding: spacing(5), flexGrow: 1 }}
      ListHeaderComponent={<ErrorText>{error}</ErrorText>}
      renderItem={({ item }) => <PedidoCard p={item} onAction={onAction} />}
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

const styles = StyleSheet.create({
  segmented: { flexDirection: 'row', backgroundColor: colors.white, borderRadius: 25, padding: 4, borderWidth: 1, borderColor: colors.border },
  segment: { flex: 1, alignItems: 'center', paddingVertical: spacing(2.5), borderRadius: 21 },
  segmentOn: { backgroundColor: colors.primary },
});
