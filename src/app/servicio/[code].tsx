import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { AppText, Button, EmptyState, ErrorText, Screen, SelectField, TextField } from '../../components/ui';
import { useAuth } from '../../context/AuthProvider';
import { getService } from '../../domain/services';
import { required } from '../../domain/validation';
import { useAddresses } from '../../hooks';
import { isOnline, OFFLINE_MESSAGE } from '../../net';
import { crearPedido } from '../../services/pedidos';
import { isProfileComplete } from '../../services/users';
import { colors, spacing } from '../../theme';

/**
 * Una sola pantalla de pedido parametrizada por servicio (en Java e iOS eran 15 pantallas copiadas).
 * Sigue el formulario de la app iOS: ¿Qué marca? · ¿En qué te podemos ayudar? · Dirección (+) · Cancelar / Enviar.
 */
export default function SolicitarServicio() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const service = getService(code);
  const { user, profile } = useAuth();
  const { data: addresses, loading: loadingAddresses } = useAddresses();
  const { width } = useWindowDimensions();
  const [marca, setMarca] = useState('');
  const [des, setDes] = useState('');
  const [dirId, setDirId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  if (!service || !service.enabled) {
    return (
      <Screen>
        <EmptyState title="Servicio no disponible" message="Este servicio estará disponible pronto." action={<Button title="Volver" onPress={() => router.back()} />} />
      </Screen>
    );
  }

  // Igual que iOS: se preselecciona la primera dirección guardada.
  const address = addresses.find((a) => a.id === dirId) ?? addresses[0];
  const addressLabel = (a: (typeof addresses)[number]) => `${a.name} — ${a.dirComplete}`;
  const detailQuestion = service.brands ? '¿Qué marca?' : service.detailLabel;

  const submit = async () => {
    if (!user || !isProfileComplete(profile)) return setError('Completa tu perfil antes de pedir un servicio.');
    if (!required(marca)) return setError(service.brands ? 'Elige la marca.' : `Indica: ${service.detailLabel.toLowerCase()}.`);
    if (!required(des)) return setError('Cuéntanos en qué te podemos ayudar.');
    if (!address) return setError('Agrega una dirección para el servicio.');
    if (!(await isOnline())) return setError(OFFLINE_MESSAGE);
    setError(null);
    setSending(true);
    try {
      const pedidoId = await crearPedido({ uid: user.uid, profile, address, service, marca, des });
      // En vez de volver sin más (iOS), se abre el estado del pedido recién creado.
      router.replace({ pathname: '/pedido/[id]', params: { id: pedidoId } });
    } catch {
      setError('No se pudo enviar el pedido. Intenta de nuevo.');
      setSending(false);
    }
  };

  const coverW = width - spacing(10);
  return (
    <Screen>
      <Stack.Screen options={{ title: service.label }} />
      {service.cover ? (
        <Image source={service.cover} style={{ width: coverW, height: (coverW * 202) / 480, marginBottom: spacing(4), borderRadius: 16 }} resizeMode="contain" />
      ) : null}
      {service.brands ? (
        <SelectField
          label={detailQuestion}
          value={marca}
          placeholder="¿De qué marca es tu producto?"
          options={service.brands.map((b) => b.name)}
          onChange={setMarca}
          renderOption={(name) => {
            const b = service.brands!.find((x) => x.name === name);
            return (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(3) }}>
                {b?.logo ? <Image source={b.logo} style={{ width: 32, height: 32 }} resizeMode="contain" /> : <View style={{ width: 32 }} />}
                <AppText style={{ color: colors.dark }}>{name}</AppText>
              </View>
            );
          }}
        />
      ) : (
        <TextField label={detailQuestion} value={marca} onChangeText={setMarca} maxLength={80} />
      )}
      <TextField
        label="¿En qué te podemos ayudar?"
        value={des}
        onChangeText={setDes}
        multiline
        maxLength={500}
        style={{ minHeight: 110, paddingTop: spacing(3), textAlignVertical: 'top' }}
        placeholder="Cuéntanos qué pasa para enviarte el técnico adecuado"
      />
      <AppText style={styles.counter}>{des.length}/500</AppText>

      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing(2) }}>
        <View style={{ flex: 1 }}>
          {loadingAddresses || addresses.length ? (
            <SelectField
              label="Dirección"
              value={address ? addressLabel(address) : ''}
              placeholder="¿A qué dirección quieres el servicio?"
              options={addresses.map(addressLabel)}
              onChange={(label) => setDirId(addresses.find((a) => addressLabel(a) === label)?.id ?? null)}
            />
          ) : (
            <View style={{ marginBottom: spacing(4) }}>
              <AppText weight="medium" style={{ fontSize: 13, color: colors.dark, marginBottom: spacing(1.5) }}>
                Dirección
              </AppText>
              <AppText>No tienes direcciones guardadas. Agrega una con el botón +.</AppText>
            </View>
          )}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Agregar dirección"
          onPress={() => router.push('/direcciones/nueva')}
          style={({ pressed }) => [styles.addDir, pressed && { opacity: 0.8 }]}
        >
          <Ionicons name="add" size={26} color={colors.primary} />
        </Pressable>
      </View>

      <ErrorText>{error}</ErrorText>
      <View style={{ flexDirection: 'row', gap: spacing(3) }}>
        <Button title="Cancelar" variant="secondary" onPress={() => router.back()} style={{ flex: 1 }} />
        <Button title="Enviar" onPress={submit} loading={sending} style={{ flex: 1 }} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  counter: { fontSize: 11, color: colors.muted, textAlign: 'right', marginTop: -spacing(3), marginBottom: spacing(3) },
  addDir: {
    width: 48,
    height: 48,
    marginTop: spacing(6),
    borderRadius: 24,
    backgroundColor: colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
