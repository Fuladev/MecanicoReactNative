import { router } from 'expo-router';
import { Alert, Image, View } from 'react-native';
import { AppText, Button, Card, Screen } from '../../components/ui';
import { useAuth } from '../../context/AuthProvider';
import { authErrorMessage, deleteAccount, signOut } from '../../services/auth';
import { colors, spacing } from '../../theme';

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <View style={{ paddingVertical: spacing(2) }}>
      <AppText style={{ fontSize: 12, color: colors.muted }}>{label}</AppText>
      <AppText style={{ color: colors.dark }}>{value || '—'}</AppText>
    </View>
  );
}

export default function Perfil() {
  const { profile, user } = useAuth();

  const confirmDelete = () =>
    Alert.alert('Eliminar cuenta', 'Se borrarán tu perfil, tus direcciones y tu historial. Esta acción no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAccount();
          } catch (e) {
            Alert.alert('No se pudo eliminar', authErrorMessage(e));
          }
        },
      },
    ]);

  return (
    <Screen>
      <View style={{ alignItems: 'center', marginBottom: spacing(5) }}>
        <Image source={require('../../../assets/images/tabs/perfil.png')} style={{ width: 90, height: 90 }} />
      </View>
      <Card>
        <Row label="Nombre" value={profile?.name} />
        <Row label="Apellido" value={profile?.apel} />
        <Row label="Correo" value={profile?.mail || user?.email || ''} />
        <Row label="Celular" value={profile?.phone} />
      </Card>
      <Button title="Editar datos" variant="secondary" onPress={() => router.push('/perfil/editar')} />
      <Button title="Cerrar sesión" onPress={() => signOut()} />
      <Button title="Eliminar cuenta" variant="ghost" onPress={confirmDelete} />
    </Screen>
  );
}
