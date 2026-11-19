import { Banners } from '../../components/Banners';
import { ServiceGrid } from '../../components/ServiceGrid';
import { Screen, Title } from '../../components/ui';
import { servicesByCategory } from '../../domain/services';

export default function Motores() {
  return (
    <Screen>
      <Banners />
      <Title style={{ fontSize: 18 }}>Vehículos y maquinaria</Title>
      <ServiceGrid services={servicesByCategory('motores')} />
    </Screen>
  );
}
