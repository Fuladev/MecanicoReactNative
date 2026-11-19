import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { AddressForm, emptyAddress, validateAddress, type AddressErrors, type AddressFormValue } from '../../components/AddressForm';
import { Button, EmptyState, ErrorText, Loading, Screen } from '../../components/ui';
import { useAuth } from '../../context/AuthProvider';
import { buildAddress } from '../../domain/address';
import type { AddressWithId } from '../../domain/schema';
import { useAddresses } from '../../hooks';
import { updateAddress } from '../../services/users';

/** "Editar dirección" (ModifyDirViewController en iOS). */
export default function EditarDireccion() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, loading } = useAddresses();
  const current = data.find((a) => a.id === id);

  if (loading) return <Loading />;
  if (!current) {
    return (
      <Screen>
        <EmptyState title="Dirección no encontrada" action={<Button title="Volver" onPress={() => router.back()} />} />
      </Screen>
    );
  }
  return <EditForm key={current.id} current={current} />;
}

function EditForm({ current }: { current: AddressWithId }) {
  const { user } = useAuth();
  const [value, setValue] = useState<AddressFormValue>(() => ({
    ...emptyAddress,
    name: current.name,
    departamento: current.departamento,
    ciudad: current.ciudad,
    direccion: current.direccion,
    barrio: current.barrio,
    casa: current.casa ?? '',
  }));
  const [errors, setErrors] = useState<AddressErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!user) return;
    const e = validateAddress(value);
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    try {
      await updateAddress(user.uid, current.id, buildAddress({ ...value, pais: current.pais }));
      router.back();
    } catch {
      setError('No se pudo guardar la dirección.');
      setSaving(false);
    }
  };

  return (
    <Screen>
      <AddressForm value={value} onChange={setValue} errors={errors} />
      <ErrorText>{error}</ErrorText>
      <Button title="Guardar cambios" onPress={submit} loading={saving} />
      <Button title="Cancelar" variant="secondary" onPress={() => router.back()} />
    </Screen>
  );
}
