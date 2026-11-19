import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { AppText, Button, ErrorText, Screen, TextField } from '../../components/ui';
import { isValidEmail } from '../../domain/validation';
import { authErrorMessage, loginWithEmail, resetPassword } from '../../services/auth';
import { colors, spacing } from '../../theme';
import { SocialButtons } from '../../components/SocialButtons';

export default function Login() {
  const [mail, setMail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!isValidEmail(mail) || !pass) return setError('Escribe tu correo y tu contraseña.');
    setError(null);
    setLoading(true);
    try {
      await loginWithEmail(mail, pass);
    } catch (e) {
      setError(authErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const forgot = async () => {
    if (!isValidEmail(mail)) return setError('Escribe tu correo arriba para enviarte el enlace.');
    try {
      await resetPassword(mail);
      Alert.alert('Revisa tu correo', 'Te enviamos un enlace para cambiar la contraseña.');
    } catch (e) {
      setError(authErrorMessage(e));
    }
  };

  return (
    <Screen>
      <TextField label="Correo" value={mail} onChangeText={setMail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" />
      <TextField label="Contraseña" value={pass} onChangeText={setPass} secureTextEntry autoComplete="password" textContentType="password" onSubmitEditing={submit} />
      <ErrorText>{error}</ErrorText>
      <Button title="Entrar" onPress={submit} loading={loading} />
      <Button title="Olvidé mi contraseña" variant="ghost" onPress={forgot} />
      <AppText style={{ textAlign: 'center', color: colors.muted, marginVertical: spacing(3) }}>o</AppText>
      <SocialButtons />
      <Button title="¿No tienes cuenta? Regístrate" variant="ghost" onPress={() => router.replace('/registro')} />
    </Screen>
  );
}
