import { router } from 'expo-router';
import { Banners } from '../../components/Banners';
import { ActivePedidoBanner, HomeHeader } from '../../components/HomeHeader';
import { ServiceGrid } from '../../components/ServiceGrid';
import { Screen, Title } from '../../components/ui';
import { servicesByCategory } from '../../domain/services';

export default function Hogar() {
  return (
    <Screen edges={['top']}>
      <HomeHeader />
      <ActivePedidoBanner />
      <Banners />
      <Title style={{ fontSize: 18 }}>¿Qué necesitas arreglar?</Title>
      <ServiceGrid services={servicesByCategory('hogar')} extra={{ label: 'Otros', icon: 'search', onPress: () => router.push('/otros') }} />
    </Screen>
  );
}
