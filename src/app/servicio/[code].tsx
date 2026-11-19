import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, useWindowDimensions, View } from 'react-native';
import { AppText, Button, EmptyState, ErrorText, Screen, SelectField, TextField } from '../../components/ui';
import { useAuth } from '../../context/AuthProvider';
import { getService } from '../../domain/services';
import { required } from '../../domain/validation';
import { useAddresses } from '../../hooks';
import { isOnline, OFFLINE_MESSAGE } from '../../net';
import { crearPedido } from '../../services/pedidos';
import { isProfileComplete } from '../../services/users';
import { colors, spacing } from '../../theme';

/** Una sola pantalla de pedido parametrizada por servicio (antes eran 15 Activities copiadas). */
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

  const address = addresses.find((a) => a.id === dirId) ?? addresses[0];
  const addressLabel = (a: (typeof addresses)[number]) => `${a.name} — ${a.dirComplete}`;

  const submit = async () => {
    if (!user || !isProfileComplete(profile)) return setError('Completa tu perfil antes de pedir un servicio.');
    if (!required(marca)) return setError(`Indica: ${service.detailLabel.toLowerCase()}.`);
    if (!required(des)) return setError('Describe el problema.');
    if (!address) return setError('Elige una dirección.');
    if (!(await isOnline())) return setError(OFFLINE_MESSAGE);
    setError(null);
    setSending(true);
    try {
      await crearPedido({ uid: user.uid, profile, address, service, marca, des });
      Alert.alert('¡Pedido enviado!', 'En breve se te asignará un técnico.');
      router.dismissTo('/pedidos');
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
        <Image source={service.cover} style={{ width: coverW, height: (coverW * 202) / 480, marginBottom: spacing(4) }} resizeMode="contain" />
      ) : null}
      {service.brands ? (
        <SelectField
          label={service.detailLabel}
          value={marca}
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
        <TextField label={service.detailLabel} value={marca} onChangeText={setMarca} maxLength={80} />
      )}
      <TextField
        label="¿Qué problema tiene?"
        value={des}
        onChangeText={setDes}
        multiline
        maxLength={500}
        style={{ minHeight: 110, paddingTop: spacing(3), textAlignVertical: 'top' }}
        placeholder="Cuéntanos qué pasa para enviarte el técnico adecuado"
      />
      {loadingAddresses ? null : addresses.length ? (
        <SelectField
          label="Dirección del servicio"
          value={address ? addressLabel(address) : ''}
          options={addresses.map(addressLabel)}
          onChange={(label) => setDirId(addresses.find((a) => addressLabel(a) === label)?.id ?? null)}
        />
      ) : (
        <AppText style={{ marginBottom: spacing(3) }}>No tienes direcciones guardadas.</AppText>
      )}
      <Button title="Agregar otra dirección" variant="ghost" onPress={() => router.push('/direcciones/nueva')} />
      <ErrorText>{error}</ErrorText>
      <Button title="Solicitar servicio" onPress={submit} loading={sending} />
      <Button title="Cancelar" variant="secondary" onPress={() => router.back()} />
    </Screen>
  );
}
