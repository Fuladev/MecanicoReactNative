import { ServiceGrid } from '../components/ServiceGrid';
import { Screen } from '../components/ui';
import { servicesByCategory } from '../domain/services';

export default function Otros() {
  return (
    <Screen>
      <ServiceGrid services={servicesByCategory('otros')} />
    </Screen>
  );
}
