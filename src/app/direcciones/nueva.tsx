import { router } from 'expo-router';
import { useState } from 'react';
import { AddressForm, emptyAddress, validateAddress, type AddressErrors, type AddressFormValue } from '../../components/AddressForm';
import { Button, ErrorText, Screen } from '../../components/ui';
import { useAuth } from '../../context/AuthProvider';
import { buildAddress } from '../../domain/address';
import { addAddress } from '../../services/users';

export default function NuevaDireccion() {
  const { user } = useAuth();
  const [value, setValue] = useState<AddressFormValue>(emptyAddress);
  const [errors, setErrors] = useState<AddressErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!user) return;
    const e = validateAddress(value);
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    try {
      await addAddress(user.uid, buildAddress(value));
      router.back();
    } catch {
      setError('No se pudo guardar la dirección.');
      setLoading(false);
    }
  };

  return (
    <Screen>
      <AddressForm value={value} onChange={setValue} errors={errors} />
      <ErrorText>{error}</ErrorText>
      <Button title="Guardar dirección" onPress={submit} loading={loading} />
    </Screen>
  );
}
