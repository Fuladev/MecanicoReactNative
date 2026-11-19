import { useEffect, useState } from 'react';
import { useAuth } from './context/AuthProvider';
import type { AddressWithId, PedidoWithId } from './domain/schema';
import { subscribeMisPedidos } from './services/pedidos';
import { subscribeAddresses } from './services/users';

type Loadable<T> = { data: T; loading: boolean; error: string | null };

export function useAddresses(): Loadable<AddressWithId[]> {
  const { user } = useAuth();
  const [state, setState] = useState<Loadable<AddressWithId[]>>({ data: [], loading: true, error: null });
  useEffect(() => {
    if (!user) return;
    return subscribeAddresses(
      user.uid,
      (data) => setState({ data, loading: false, error: null }),
      () => setState({ data: [], loading: false, error: 'No se pudieron cargar tus direcciones.' }),
    );
  }, [user]);
  return state;
}

export function useMisPedidos(): Loadable<PedidoWithId[]> {
  const { user } = useAuth();
  const [state, setState] = useState<Loadable<PedidoWithId[]>>({ data: [], loading: true, error: null });
  useEffect(() => {
    if (!user) return;
    return subscribeMisPedidos(
      user.uid,
      (data) => setState({ data, loading: false, error: null }),
      () => setState({ data: [], loading: false, error: 'No se pudieron cargar tus pedidos.' }),
    );
  }, [user]);
  return state;
}
