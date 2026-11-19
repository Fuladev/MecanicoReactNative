import { router } from 'expo-router';
import { Image, View } from 'react-native';
import { AppText, Button, Screen } from '../../components/ui';
import { colors, spacing } from '../../theme';
import { SocialButtons } from '../../components/SocialButtons';

export default function Bienvenida() {
  return (
    <Screen edges={['top', 'bottom']}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing(8) }}>
        <Image source={require('../../../assets/images/ic_logo.png')} style={{ width: 132, height: 185 }} resizeMode="contain" />
        <AppText style={{ textAlign: 'center', marginTop: spacing(5), fontSize: 16 }}>
          Técnicos y mecánicos a domicilio, cuando los necesites.
        </AppText>
      </View>
      <Button title="Iniciar sesión" onPress={() => router.push('/login')} />
      <Button title="Crear cuenta" variant="secondary" onPress={() => router.push('/registro')} />
      <SocialButtons />
      <AppText style={{ textAlign: 'center', fontSize: 12, color: colors.muted, marginTop: spacing(2) }}>Versión Beta</AppText>
    </Screen>
  );
}
