import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import type { ComponentProps } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { AppText, Card, Screen } from '../../components/ui';
import { useAuth } from '../../context/AuthProvider';
import { confirmAction, notify } from '../../dialogs';
import { authErrorMessage, deleteAccount, resetPassword, signOut } from '../../services/auth';
import { colors, spacing } from '../../theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

function Row({ icon, label, value }: { icon: IconName; label: string; value?: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <AppText style={{ fontSize: 12, color: colors.muted }}>{label}</AppText>
        <AppText style={{ color: colors.dark }}>{value || '—'}</AppText>
      </View>
    </View>
  );
}

function Action({ icon, label, onPress, danger }: { icon: IconName; label: string; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}>
      <View style={[styles.rowIcon, danger && { backgroundColor: colors.background }]}>
        <Ionicons name={icon} size={18} color={danger ? colors.muted : colors.primary} />
      </View>
      <AppText weight="medium" style={{ flex: 1, color: danger ? colors.muted : colors.dark }}>
        {label}
      </AppText>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>
  );
}

/** Perfil (ProfileViewController en iOS): datos, cambiar contraseña y cerrar sesión. */
export default function Perfil() {
  const { profile, user } = useAuth();
  const mail = profile?.mail || user?.email || '';
  const usesPassword = !!user?.providerData.some((p) => p.providerId === 'password');

  const cambiarPass = () =>
    confirmAction({
      title: 'Cambiar contraseña',
      message: `Te enviaremos un enlace a ${mail} para crear una nueva contraseña.`,
      confirmText: 'Enviar enlace',
      onConfirm: () =>
        resetPassword(mail)
          .then(() => notify('Revisa tu correo', 'Te enviamos el enlace para cambiar la contraseña.'))
          .catch((e) => notify('No se pudo enviar', authErrorMessage(e))),
    });

  const confirmDelete = () =>
    confirmAction({
      title: 'Eliminar cuenta',
      message: 'Se borrarán tu perfil, tus direcciones y tu historial. Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      destructive: true,
      onConfirm: () => deleteAccount().catch((e) => notify('No se pudo eliminar', authErrorMessage(e))),
    });

  return (
    <Screen>
      <View style={{ alignItems: 'center', marginBottom: spacing(5) }}>
        <Image source={require('../../../assets/images/tabs/perfil.png')} style={{ width: 90, height: 90 }} />
        <AppText weight="bold" style={{ fontSize: 20, color: colors.dark, marginTop: spacing(3) }}>
          {[profile?.name, profile?.apel].filter(Boolean).join(' ')}
        </AppText>
      </View>
      <Card>
        <Row icon="person-outline" label="Nombres" value={profile?.name} />
        <Row icon="people-outline" label="Apellidos" value={profile?.apel} />
        <Row icon="mail-outline" label="Correo" value={mail} />
        <Row icon="call-outline" label="Teléfono" value={profile?.phone} />
      </Card>
      <Card>
        <Action icon="create-outline" label="Editar datos" onPress={() => router.push('/perfil/editar')} />
        {usesPassword ? <Action icon="key-outline" label="Cambiar contraseña" onPress={cambiarPass} /> : null}
        <Action icon="log-out-outline" label="Cerrar sesión" onPress={() => signOut()} />
      </Card>
      <Card>
        <Action icon="trash-outline" label="Eliminar cuenta" onPress={confirmDelete} danger />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing(3), paddingVertical: spacing(2.5) },
  rowIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.pink, alignItems: 'center', justifyContent: 'center' },
});
