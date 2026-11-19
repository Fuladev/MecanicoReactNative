import { useState } from 'react';
import { AddressForm, emptyAddress, validateAddress, type AddressErrors, type AddressFormValue } from '../components/AddressForm';
import { AppText, Button, ErrorText, Screen, TextField } from '../components/ui';
import { useAuth } from '../context/AuthProvider';
import { buildAddress } from '../domain/address';
import { isValidPhone, normalizePhone, required } from '../domain/validation';
import { useAddresses } from '../hooks';
import { signOut } from '../services/auth';
import { addAddress, saveProfile } from '../services/users';
import { colors, spacing } from '../theme';

/**
 * Reemplaza la pantalla `Datos` de la app Java: se muestra cuando falta nombre/apellido/celular
 * (por ejemplo, tras el primer login con Google). Solo actualiza campos: no borra direcciones.
 */
export default function CompletarPerfil() {
  const { user, profile } = useAuth();
  const { data: addresses, loading: loadingAddresses } = useAddresses();
  const [name, setName] = useState(profile?.name ?? '');
  const [apel, setApel] = useState(profile?.apel ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [address, setAddress] = useState<AddressFormValue>({ ...emptyAddress, name: 'Casa' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [addrErrors, setAddrErrors] = useState<AddressErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const needsAddress = !loadingAddresses && addresses.length === 0;


  const submit = async () => {
    if (!user) return;
    const e: Record<string, string> = {};
    if (!required(name)) e.name = 'Escribe tu nombre.';
    if (!required(apel)) e.apel = 'Escribe tu apellido.';
    if (!isValidPhone(phone)) e.phone = 'Escribe un celular de 10 dígitos.';
    const ae = needsAddress ? validateAddress(address) : {};
    setErrors(e);
    setAddrErrors(ae);
    if (Object.keys(e).length || Object.keys(ae).length) return setError('Revisa los campos marcados.');
    setLoading(true);
    setError(null);
    try {
      if (needsAddress) await addAddress(user.uid, buildAddress(address));
      await saveProfile(user.uid, { name, apel, phone: normalizePhone(phone), mail: profile?.mail || user.email || '' });
    } catch {
      setError('No se pudieron guardar los datos. Revisa tu conexión e intenta de nuevo.');
      setLoading(false);
    }
  };

  return (
    <Screen>
      <AppText style={{ marginBottom: spacing(4) }}>Necesitamos estos datos para que el técnico pueda contactarte.</AppText>
      <TextField label="Correo" value={profile?.mail || user?.email || ''} editable={false} style={{ color: colors.muted }} />
      <TextField label="Nombre" value={name} onChangeText={setName} error={errors.name} />
      <TextField label="Apellido" value={apel} onChangeText={setApel} error={errors.apel} />
      <TextField label="Celular" value={phone} onChangeText={setPhone} keyboardType="phone-pad" error={errors.phone} />
      {needsAddress ? (
        <>
          <AppText weight="bold" style={{ color: colors.dark, fontSize: 17, marginVertical: spacing(3) }}>
            Tu dirección
          </AppText>
          <AddressForm value={address} onChange={setAddress} errors={addrErrors} />
        </>
      ) : null}
      <ErrorText>{error}</ErrorText>
      <Button title="Guardar" onPress={submit} loading={loading} />
      <Button title="Cerrar sesión" variant="ghost" onPress={() => signOut()} />
    </Screen>
  );
}
