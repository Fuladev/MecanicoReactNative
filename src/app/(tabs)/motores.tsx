import { Banners } from '../../components/Banners';
import { ActivePedidoBanner, HomeHeader } from '../../components/HomeHeader';
import { ServiceGrid } from '../../components/ServiceGrid';
import { Screen, Title } from '../../components/ui';
import { servicesByCategory } from '../../domain/services';

export default function Motores() {
  return (
    <Screen edges={['top']}>
      <HomeHeader />
      <ActivePedidoBanner />
      <Banners />
      <Title style={{ fontSize: 18 }}>Vehículos y maquinaria</Title>
      <ServiceGrid services={servicesByCategory('motores')} />
    </Screen>
  );
}
