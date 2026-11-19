import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { Share, StyleSheet, View } from 'react-native';
import { formatPedidoDate, pedidoTitle } from '../../../components/Pedido';
import { AppText, Button, Card, EmptyState, Loading, Screen } from '../../../components/ui';
import { notify } from '../../../dialogs';
import { formatMoney } from '../../../domain/pedido';
import { usePedido } from '../../../hooks';
import { colors, spacing } from '../../../theme';

function Line({ label, value, strong }: { label: string; value?: string; strong?: boolean }) {
  return (
    <View style={styles.line}>
      <AppText weight={strong ? 'bold' : 'regular'} style={{ flex: 1, color: strong ? colors.dark : colors.text, fontSize: strong ? 17 : 15 }}>
        {label}
      </AppText>
      <AppText weight={strong ? 'bold' : 'medium'} style={{ color: colors.dark, fontSize: strong ? 17 : 15 }}>
        {formatMoney(value)}
      </AppText>
    </View>
  );
}

/** Factura que deja el técnico al terminar (FacturaViewController en iOS). */
export default function Factura() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: p, loading } = usePedido(id);
  if (loading) return <Loading />;
  const f = p?.Factura;
  if (!p || !f) {
    return (
      <Screen>
        <EmptyState
          title="Factura no disponible"
          message="El técnico aún no ha registrado los valores del servicio."
          action={<Button title="Volver" onPress={() => router.back()} />}
        />
      </Screen>
    );
  }

  const compartir = async () => {
    const texto = [
      `Factura Mecanico · ${pedidoTitle(p)}`,
      formatPedidoDate(p),
      `Servicio: ${formatMoney(f.valServ)}`,
      `Repuestos: ${formatMoney(f.valRep)}`,
      `Otros: ${formatMoney(f.valOtro)}`,
      `Subtotal: ${formatMoney(f.subTotal)}`,
      `IVA: ${formatMoney(f.iva)}`,
      `Total: ${formatMoney(f.total)}`,
    ].join('\n');
    try {
      await Share.share({ message: texto, title: 'Factura Mecanico' });
    } catch {
      notify('No se pudo compartir', 'Tu dispositivo no permite compartir desde aquí.');
    }
  };

  return (
    <Screen>
      <Card style={{ paddingVertical: spacing(5) }}>
        <View style={{ alignItems: 'center', marginBottom: spacing(4) }}>
          <View style={styles.badge}>
            <Ionicons name="checkmark-circle" size={36} color={colors.success} />
          </View>
          <AppText weight="bold" style={{ fontSize: 18, color: colors.dark, marginTop: spacing(2) }}>
            Servicio completado
          </AppText>
          <AppText style={{ fontSize: 13, color: colors.muted, textAlign: 'center' }}>
            {pedidoTitle(p)} · {formatPedidoDate(p)}
          </AppText>
        </View>

        <AppText weight="bold" style={{ color: colors.dark }}>
          {f.name || [p.name, p.apel].filter(Boolean).join(' ')}
        </AppText>
        <AppText style={{ fontSize: 14 }}>{f.phone || p.cel}</AppText>
        <AppText style={{ fontSize: 14, marginBottom: spacing(3) }}>{f.dir || p.dir}</AppText>

        <View style={styles.divider} />
        <Line label="Valor servicio" value={f.valServ} />
        <Line label="Valor repuestos" value={f.valRep} />
        <Line label="Valor otros" value={f.valOtro} />
        <View style={styles.divider} />
        <Line label="Subtotal" value={f.subTotal} />
        <Line label="IVA (19%)" value={f.iva} />
        <View style={styles.divider} />
        <Line label="Total" value={f.total} strong />
      </Card>

      <Button title="Compartir" icon={<Ionicons name="share-outline" size={18} color={colors.white} />} onPress={compartir} />
      <AppText style={{ textAlign: 'center', fontSize: 13, color: colors.muted, marginBottom: spacing(3) }}>
        El pago en línea estará disponible pronto.
      </AppText>
      <Button title="Volver al inicio" variant="secondary" onPress={() => router.dismissTo('/')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  badge: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#DDF7E4', alignItems: 'center', justifyContent: 'center' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: spacing(2) },
  line: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing(1.5) },
});
