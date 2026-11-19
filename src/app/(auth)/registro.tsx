import { useState } from 'react';
import { Alert } from 'react-native';
import { AddressForm, emptyAddress, validateAddress, type AddressErrors, type AddressFormValue } from '../../components/AddressForm';
import { AppText, Button, ErrorText, Screen, TextField } from '../../components/ui';
import { buildAddress } from '../../domain/address';
import { isValidEmail, isValidPhone, normalizePhone, passwordError, required } from '../../domain/validation';
import { authErrorMessage, registerWithEmail } from '../../services/auth';
import { createProfileWithAddress } from '../../services/users';
import { colors, spacing } from '../../theme';

type Errors = Partial<Record<'name' | 'apel' | 'phone' | 'mail' | 'pass', string>>;

export default function Registro() {
  const [name, setName] = useState('');
  const [apel, setApel] = useState('');
  const [phone, setPhone] = useState('');
  const [mail, setMail] = useState('');
  const [pass, setPass] = useState('');
  const [cpass, setCpass] = useState('');
  const [address, setAddress] = useState<AddressFormValue>({ ...emptyAddress, name: 'Casa' });
  const [errors, setErrors] = useState<Errors>({});
  const [addrErrors, setAddrErrors] = useState<AddressErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const e: Errors = {};
    if (!required(name)) e.name = 'Escribe tu nombre.';
    if (!required(apel)) e.apel = 'Escribe tu apellido.';
    if (!isValidPhone(phone)) e.phone = 'Escribe un celular de 10 dígitos.';
    if (!isValidEmail(mail)) e.mail = 'Escribe un correo válido.';
    const pe = passwordError(pass, cpass);
    if (pe) e.pass = pe;
    const ae = validateAddress(address);
    setErrors(e);
    setAddrErrors(ae);
    if (Object.keys(e).length || Object.keys(ae).length) return setError('Revisa los campos marcados.');
    setError(null);
    setLoading(true);
    try {
      const user = await registerWithEmail(mail, pass);
      // La contraseña NO se guarda en la base de datos (antes se guardaba en texto plano en Users/{uid}/pass).
      await createProfileWithAddress(
        user.uid,
        { name, apel, phone: normalizePhone(phone), mail: user.email ?? mail },
        buildAddress(address),
      );
      Alert.alert('¡Bienvenido!', 'Te enviamos un correo para verificar tu cuenta.');
    } catch (err) {
      setError(authErrorMessage(err));
      setLoading(false);
    }
  };

  return (
    <Screen>
      <AppText weight="bold" style={{ color: colors.dark, fontSize: 17, marginBottom: spacing(3) }}>
        Tus datos
      </AppText>
      <TextField label="Nombre" value={name} onChangeText={setName} autoComplete="given-name" error={errors.name} />
      <TextField label="Apellido" value={apel} onChangeText={setApel} autoComplete="family-name" error={errors.apel} />
      <TextField label="Celular" value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoComplete="tel" error={errors.phone} />
      <TextField label="Correo" value={mail} onChangeText={setMail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" error={errors.mail} />
      <TextField label="Contraseña" value={pass} onChangeText={setPass} secureTextEntry autoComplete="new-password" textContentType="newPassword" error={errors.pass} />
      <TextField label="Confirmar contraseña" value={cpass} onChangeText={setCpass} secureTextEntry autoComplete="new-password" textContentType="newPassword" />
      <AppText weight="bold" style={{ color: colors.dark, fontSize: 17, marginVertical: spacing(3) }}>
        Tu dirección
      </AppText>
      <AddressForm value={address} onChange={setAddress} errors={addrErrors} />
      <ErrorText>{error}</ErrorText>
      <Button title="Crear cuenta" onPress={submit} loading={loading} />
    </Screen>
  );
}
