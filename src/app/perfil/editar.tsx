import { router } from 'expo-router';
import { useState } from 'react';
import { Button, ErrorText, Screen, TextField } from '../../components/ui';
import { useAuth } from '../../context/AuthProvider';
import { isValidPhone, normalizePhone, required } from '../../domain/validation';
import { saveProfile } from '../../services/users';

export default function EditarPerfil() {
  const { user, profile } = useAuth();
  const [name, setName] = useState(profile?.name ?? '');
  const [apel, setApel] = useState(profile?.apel ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!user) return;
    if (!required(name) || !required(apel)) return setError('Escribe tu nombre y apellido.');
    if (!isValidPhone(phone)) return setError('Escribe un celular de 10 dígitos.');
    setLoading(true);
    try {
      await saveProfile(user.uid, { name, apel, phone: normalizePhone(phone), mail: profile?.mail || user.email || '' });
      router.back();
    } catch {
      setError('No se pudieron guardar los cambios.');
      setLoading(false);
    }
  };

  return (
    <Screen>
      <TextField label="Nombre" value={name} onChangeText={setName} />
      <TextField label="Apellido" value={apel} onChangeText={setApel} />
      <TextField label="Celular" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <ErrorText>{error}</ErrorText>
      <Button title="Guardar" onPress={submit} loading={loading} />
    </Screen>
  );
}
