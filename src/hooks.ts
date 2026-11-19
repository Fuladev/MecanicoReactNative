import { useEffect, useState } from 'react';
import { useAuth } from './context/AuthProvider';
import type { AddressWithId, PedidoWithId } from './domain/schema';
import { subscribeMisPedidos, subscribePedido } from './services/pedidos';
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

export function usePedido(pedidoId: string | undefined): Loadable<PedidoWithId | null> {
  const { user } = useAuth();
  const [state, setState] = useState<Loadable<PedidoWithId | null>>({ data: null, loading: true, error: null });
  useEffect(() => {
    if (!user || !pedidoId) return;
    return subscribePedido(
      user.uid,
      pedidoId,
      (data) => setState({ data, loading: false, error: null }),
      () => setState({ data: null, loading: false, error: 'No se pudo cargar el pedido.' }),
    );
  }, [user, pedidoId]);
  return state;
}
