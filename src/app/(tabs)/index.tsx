import { router } from 'expo-router';
import { Image, Pressable, View } from 'react-native';
import { Banners } from '../../components/Banners';
import { ServiceGrid } from '../../components/ServiceGrid';
import { AppText, Screen, Title } from '../../components/ui';
import { useAuth } from '../../context/AuthProvider';
import { servicesByCategory } from '../../domain/services';
import { colors, spacing } from '../../theme';

export default function Hogar() {
  const { profile } = useAuth();
  return (
    <Screen edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing(5) }}>
        <View style={{ flex: 1 }}>
          <AppText style={{ fontSize: 13 }}>Hola,</AppText>
          <AppText weight="bold" style={{ fontSize: 20, color: colors.dark }} numberOfLines={1}>
            {[profile?.name, profile?.apel].filter(Boolean).join(' ')}
          </AppText>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Perfil" onPress={() => router.navigate('/perfil')}>
          <Image source={require('../../../assets/images/tabs/perfil.png')} style={{ width: 44, height: 44 }} />
        </Pressable>
      </View>
      <Banners />
      <Title style={{ fontSize: 18 }}>Servicios para el hogar</Title>
      <ServiceGrid services={servicesByCategory('hogar')} />
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/otros')}
        style={{ backgroundColor: colors.pink, borderRadius: 16, padding: spacing(4), alignItems: 'center' }}
      >
        <AppText weight="bold" style={{ color: colors.primary }}>
          Ver otros servicios
        </AppText>
      </Pressable>
    </Screen>
  );
}
